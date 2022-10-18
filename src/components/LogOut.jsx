import React, { useState } from 'react';
import { Button } from "react-bootstrap";
import { Link } from 'react-router-dom';

function LogOut(props) {
    const [isLogOut, setisLogOut] = useState(
       false
    );
    function onClick() {
        sessionStorage.clear();
        setisLogOut(true)
    }
    return (
        <div>
            
            <Link to="/" onClick={onClick}><Button  type="button"  style={{ backgroundColor: 'darkblue', color: 'white', "marginLeft": "20px", fontWeight: 'bold', color: 'Black' }}>
                SignOut
            </Button></Link>
        </div>

    );
}

export default LogOut
