const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const express = require('express')
const index = express()
const fileupload = require('express-fileupload');
let cors = require('cors');
const port = 3001
const filesystem = require('fs');
const dotenv = require('dotenv');
const config = dotenv.config();

index.use(fileupload({
  useTempFiles: true,
  //tempFileDir: 'tmp'
}));
index.use(express.json())
index.use(cors())
index.use(express.urlencoded({ extended: true }))

function unlinkanddeletetempfilepath(tempFilePath) {
  try {
    filesystem.unlinkSync(tempFilePath)
  } catch (error) {
    console.error("There was an error in deleting the temp file " + error);
  }
}

const S3bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' ,
    region: "us-west-1",
    endpoint: "http://dynamodb.us-west-1.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});


index.post('/uploadfile', function (request, response) {
  if (!request.files || Object.keys(request.files).length === 0) {
    return response.status(400).send('No files were uploaded.');
  }
  const contentoffile = filesystem.createReadStream(request.files.inputFile.tempFilePath);
  const bucketparameters = {
    Bucket: "dropboxcloud1",
    Key: request.files.inputFile.name,
    Body: contentoffile
    //ContentType: req.files.inputFile.mimetype
  };

  // Uploading files to the bucket
  S3bucket.upload(bucketparameters, function (error, data) {
    if (error) {
      console.log("Unable to upload file at this time", error);
      return response.status(500).send(`Unable to upload the file. ${error}`)
      // Send 500 Response 
    } else {
      unlinkanddeletetempfilepath(request.files.inputFile.tempFilePath);
      insertdetailsintoDB();
      console.log(`File uploaded successfully. ${data.Location}`);
      return response.status(200).send(`File has been uploaded successfully to the s3 bucket. ${data.Location}`)
    }
  });

  function insertdetailsintoDB() {
    // console.log(`userName: ${req.body.userName}`)//.body.userName
    // console.log(`FileName: ${req.files.inputFile}`)
    //var currentTime = new Date().toString();
    // console.log(`currentTime: ${currentTime}`)
    //var epoch = Math.floor(currentTime/1000)
    //var time = new Date();
    // var userName = req.body.userName
    // console.log(req.body);
    // var description = req.body.description
    // var fileName = req.files.inputFile.name;
    // var userId = userName.concat("_", fileName)
    // console.log(`userId: ${userId}`)
    // console.log(`description: ${description}`)

    dynamoDB.scan({
      TableName: 'dropbox',
    }, function (error, data) {
      if (error) {
        console.log("Error", error);

      } else {
        console.log("Successfully retrieved items", data.Items);
        const itemspresent = data.Items.filter(item => item.userId.S === (request.body.userName.concat("_", request.files.inputFile.name)));
        if (itemspresent.length > 0) {
          console.log("File already exists- update the file", itemspresent);
          const itemspresent = itemspresent[0];
          console.log("add new file", itemspresent);
          insertintotable(request.body.userName.concat("_", request.files.inputFile.name), request.body.userName, request.files.inputFile.name,request.body.description, itemspresent.filecreatedtime.S, new Date().toString());
        } else {
          //console.log("It is new file, so creating new record ", userId);
          insertintotable(request.body.userName.concat("_", request.files.inputFile.name), request.body.userName, request.files.inputFile.name,request.body.description, new Date().toString(), new Date().toString());
        }

      }
    });

  }

});

function insertintotable(userid, username, filename, description, filecreationtime,fileupdatedtime) {
  const tabledata = {
    TableName: 'dropbox',
    Item: {
      'userId': { S: userid },
      'userName': { S: username },
      'fileName': { S: filename },
      'description': { S: description },
      'fileCreatedTime': { S: filecreationtime },
      'fileUpdatedTime': { S: fileupdatedtime }
    }
  };

  // Call DynamoDB to add the item to the table
  dynamoDB.putItem(tabledata, function (error, data) {
    if (error) {
      console.log("There was an error inserting data", error);
    } else {
      console.log("data added successfully", data);
    }
  });
}

index.delete('/delete_file', function (request, response) {
  console.log("REQUEST param ", request.body);
  if (!request.body || !request.body.hasOwnProperty('deleteFile')) {
    return response.status(400).send('body or deletefile is missing');
  }

  //const fileDeletePath = request.body.deleteFile
  //const userId = request.body.userId
  // Setting up S3 delete parameters
  const bucketparameters = {
    Bucket: "dropboxcloud1",
    Key: request.body.deleteFile
    /*  Delete: { 
         Objects: [ 
           {
             Key: fileDeletePath 
           }
         ],
       }, This method is useful when you want to delete multiple files */
  };
  // Deleting files to the bucket
  S3bucket.deleteObject(bucketparameters, function (error, data) {
    if (error) {
      console.log("Unable to delete file", error);
      return response.status(500).send(`Unable to delete file ${error}`)
    } else {
      deletefromtable();
      console.log(`File has been deleted successfully`);
      return response.status(200).send(`File has been deleted successfully`);
    }

  });

  function deletefromtable() {
    const tabledata = {
      TableName: 'dropbox',
      Key: {
        "userId": { "S": request.body.userId }

      }
    };

    // Call DynamoDB to delete the item from the table
    dynamoDB.deleteItem(tabledata, function (error, data) {
      if (error) {
        console.log("some error in deleting file", error);
      } else {
        console.log("deleted successfully", data);
      }
    });
  }
});

index.get('/retrieveUserRecords/:userName', function (request, response) {
  AWS.config.update({
    region: "us-west-1",
    endpoint: "http://dynamodb.us-west-1.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  var clientdocument = new AWS.DynamoDB.DocumentClient();
  
  //var table = "dropbox";
  //const userName = request.params.userName
  //console.log("userName:"+userName)
  var tabledata = {
      TableName: 'dropbox',
      FilterExpression: '#userName = :userName',
      ExpressionAttributeNames: {
        '#userName' : 'userName'
      },
      ExpressionAttributeValues: {
        ':userName' : request.params.userName
      }

  };
  
  clientdocument.scan(tabledata, function(error, data) {
      if (error) {
          console.error("Unable to get user data at this time", JSON.stringify(error, null, 2));
          return response.status(500).send(`Unable to get user data at this time ${error}`)
      } else {
          console.log("User details fetched successfully", JSON.stringify(data, null, 2));
          return response.status(200).json(data.Items);
      }
  });
  
});

index.get('/retrieveAdminRecords', function (request, response) {
  AWS.config.update({
    region: "us-west-1",
    endpoint: "http://dynamodb.us-west-1.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  var clientdocument = new AWS.DynamoDB.DocumentClient();
  var tabledata = {
    TableName: 'dropbox',
    /*  Key: {
       'userId': {N: '001'}
     },
     ProjectionExpression: 'ATTRIBUTE_NAME' */
  };

  // Call DynamoDB to read the item from the table
  clientdocument.scan(tabledata, function (error, data) {
    if (error) {
      console.log("Error", error);
      return response.status(500).send(`Unable to get admin data ${error}`)
    } else {
      console.log("successfully fetched admin data", data.Items);
      return response.status(200).json(data.Items);
      //return response.status(200).json(data);
    }
  });
});


index.listen(port, () => console.log(`Backend is running on ${port}!`))