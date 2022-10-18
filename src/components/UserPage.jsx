import React, { PureComponent } from 'react'
import { Button, Navbar, Table } from "react-bootstrap";
import FileUpload from './FileUpload';
import LogOut from './LogOut';
import LogInPage from './LogInPage';
import logo from '../Dropbox_(service)-Logo.wine.svg'
var jwt = require('jsonwebtoken');

class UserPage extends PureComponent {
    constructor(props) {
        super(props)
        const sessionToken = sessionStorage.getItem("token")

        this.state = {
            dataofuserDynamo: [],
            dataofuser: undefined,
            desc: "",
            isAdmin: false
        }
    }

    getUserDataFromBackend(userName) {
        const backendapi = {
            URL: "http://localhost:3001"
        }
        const backendparameters = {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        }
        return fetch(`${backendapi.URL}/retrieveUserRecords/${userName}`, backendparameters).then(response => {
            return response.json();
        })
    }

    getAdminDataFromBackend() {
        const backendapi = {
            URL: "http://localhost:3001"
        }
        const backendparameters = {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        }
        return fetch(`${backendapi.URL}/retrieveAdminRecords`, backendparameters).then(response => {
            return response.json();
        })
    }
    deleteFile(fileName,id) {
        const backendapi = {
            URL: "http://localhost:3001"
        }
        const backendparameters = {
            method: 'DELETE',
            body: JSON.stringify({
                "deleteFile": fileName,
                "userId": id
            }),
            headers: { "Content-Type": "application/json" }
        }
        return fetch(`${backendapi.URL}/delete_file`, backendparameters)
    }

    getUserData(user) {
        //console.log("Called backend for user data");
        this.getUserDataFromBackend(user)
            .then(json => {
                if (Array.isArray(json)) {
                    this.setState({
                        dataofuserDynamo: json
                    });
                }
            })
            .catch(reason => {
                console.log("Unable to fetch user data ", reason);
            });
    }
    getAdminData() {
        //console.log("Called backend for admin data");
        this.getAdminDataFromBackend()
            .then(json => {
                if (Array.isArray(json)) {
                    this.setState({
                        dataofuserDynamo: json
                    });
                }
            })
            .catch(reason => {
                console.log("Unable to fetch admin data", reason);
            });
    }
    componentDidMount() {
        var sessiontoken = sessionStorage.getItem("token");
        var decrypttoken = jwt.decode(sessiontoken, { complete: true });
        this.setState({
            dataofuser: decrypttoken.payload
        })
        const isAdmin = decrypttoken.payload && decrypttoken.payload["cognito:groups"] && decrypttoken.payload["cognito:groups"].filter(g => g == "admin").length > 0;

        this.setState({ isAdmin });
        setTimeout(()=> {
            if (this.state.isAdmin){
                this.getAdminData()
            } else {
                this.getUserData(this.state.dataofuser.email);
            }
        }, 500);
    }
    
    downloadWhenClicked(file) {
        window.open("https://d2k9a10np1c61w.cloudfront.net/" + file);
    }

    deleteWhenClicked(fileName, id) {
        this.deleteFile(fileName, id)
            .then(json => {
                //console.log(json);
                setTimeout(()=> {
                if (this.state.isAdmin){
                    this.getAdminData()
                } else {
                    this.getUserData(this.state.dataofuser.email);
                }
            }, 300);
                
            })
            .catch(reason => {
                console.log("Unable to delete at this time: ", reason);
            });
    }
    render() {
        const { isAdmin } = this.state;
        return (
            <div>
                <Navbar className='colornav' variant="dark">
                    <Navbar.Brand><img src={logo} width = '200' height = '50' /></Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            &nbsp;&nbsp;
                            {
                                isAdmin && <a style={{ fontWeight: 'bold', color: 'Black' }}> AdminMode </a>
                            }
                        </Navbar.Text>
                    </Navbar.Collapse>
                    {this.state.dataofuser && <LogOut></LogOut>}
                    {!this.state.dataofuser && <LogInPage></LogInPage>}
                </Navbar>
                <div><br></br><br></br><center><h4>Welcome {this.state.dataofuser &&
                                <a >{this.state.dataofuser.email}</a>}. Now you can  keep everything organized, secure and easy to access.&nbsp;&nbsp;
                               </h4></center></div>
                {
                    this.state.dataofuser &&
                    <FileUpload
                        username={this.state.dataofuser.email}
                        // desc={this.state.desc}
                        userlistrefresh={e => this.getAdminData()}
                        adminlistrefresh={e => this.getUserData(e)}
                        isAdmin={isAdmin}
                    >
                    </FileUpload>
                }
                <div>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr key={0}>
                                {
                                    isAdmin &&
                                    <th>Username</th>
                                }

                                <th>Filename</th>
                                <th>FileCreatedDate</th>
                                <th>FileUpdatedDate</th>
                                <th>Description</th>
                                <th>Download</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.dataofuserDynamo.map(list => {
                                    return (
                                        <tr key={list.userId}>
                                            {
                                                isAdmin &&
                                                <td>{list.userName}</td>
                                            }

                                            <td>{list.fileName}</td>
                                            <td>{list.fileCreatedTime}</td>
                                            <td>{list.fileUpdatedTime}</td>
                                            <td>{list.description}</td>
                                            <td><Button style={{
        backgroundColor: 'green', color: 'white'
      }} onClick={e => this.downloadWhenClicked(list.fileName)}>
                                                Download
                                                
                                            </Button></td>
                                            <td><Button style={{
        backgroundColor: 'red', color: 'white'
      }} onClick={e => this.deleteWhenClicked(list.fileName, list.userId)}>
                                                Delete
                                            </Button></td>
                                        </tr>

                                    );
                                })
                            }

                        </tbody>
                    </Table>
                </div>

            </div>

        )
    }
}
export default UserPage