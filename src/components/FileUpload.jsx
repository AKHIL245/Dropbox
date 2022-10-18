import React, { PureComponent } from 'react'
import { Card, Button } from 'react-bootstrap';
var jwt = require('jsonwebtoken');

class FileUpload extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            files: [],
            descr: "",
            result: ""
        }
        this.fileUpload = this.fileUpload.bind(this);
    }

    sendFiletoBackend(fileslist, username, desc) {
        const backendapi = {
            URL: "http://localhost:3001"
        }
        const detailsofForm = new FormData();
        detailsofForm.append('inputFile', fileslist);
        detailsofForm.append('userName', username);
        detailsofForm.append('description', desc);
        const backendparameters = {
            method: 'POST',
            body: detailsofForm,
        }
        console.log(backendparameters);
        return fetch(`${backendapi.URL}/uploadfile`, backendparameters).then(response => {
          console.log(response);
            return response;
        })
    }

    fileUpload() {
        if (this.state.files.length > 0) {
            this.sendFiletoBackend(this.state.files[0], this.props.username, this.state.descr)
                .then(json => {
                    console.log(json);
                    this.setState({
                        result: "Successfully uploaded file"
                    }); 
                    setTimeout(()=> {
                        if (this.props.isAdmin){
                            this.props.userlistrefresh();
                        } else {
                            this.props.adminlistrefresh(this.props.username);
                        } 
                    }, 500);

                })
                .catch(reason => {
                    console.log(reason);
                    this.props.userlistrefresh();
                });
        }
    }

    render() {
        return (
            <div>
                <Card>
                    <Card.Header style={{
        backgroundColor: 'gray',
        color: 'black'
      }}> Upload your files here: {this.state.result} </Card.Header>
                    <Card.Body>
                        <input type="file"  onChange={list => this.setState({
                            files: list.target.files
                        })}> 
                        </input>
                       <input
                            
                            onChange={des => this.setState({
                                descr: des.target.value
                            })}
                            placeholder="Enter..."
                            type="text"
                            name="descr"
                        />
                        &nbsp; &nbsp;
                        <Button onClick={this.fileUpload} style={{
        backgroundColor: 'green'
      }}>Upload</Button>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}
export default FileUpload