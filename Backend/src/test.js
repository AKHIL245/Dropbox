// const express = require('express')
// const app = express()
// const port = 3000


// app.use(express.json())
// app.use(express.urlencoded({ extended : true}))

// app.get('/getfiles', (req, res) => {
//     var datafiles = ["file1", "file2"];
//     res.send(datafiles);
// }
// );


// app.get('/getfile/:filename', (req, res) => {
//     var params = req.params;

//     if(params.filename == 'secret') {


//         res.set('test' , '87979879');
        
       
//         res.status(400).send("Invalid, you can not read secreet");

//     } else {
//         res.send("You have sent file name as "+params.filename);
//     }
// }
// );


// app.post('/upload', (req, res, next) => {
//     console.log("Client IP", req.ip);
//     console.log("BaseUrl", req.baseUrl);
//     console.log("req :", req.body);
//     res.send("upploaded");
// });


// app.listen(port, () => console.log(`Example app listening on port ${port}!`))