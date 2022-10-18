import React from 'react'
import { Button} from "react-bootstrap";

function LogInPage() {
    return (
        <div style={{ margin: '18rem 20rem 15rem 10rem', justifyContent: "center", }}>
                    <center>
                    <Button style={{
        backgroundColor: 'green', color: 'white'
      }}  href="https://akhil-dropbox.auth.us-west-1.amazoncognito.com/login?client_id=6lf5mkel9kcp68hog30i0p7gtp&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:80/">
                        SignUp/SignIn  
                    </Button></center>
        </div>

    )
}

export default LogInPage
