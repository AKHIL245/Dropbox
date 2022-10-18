import React, { Fragment } from 'react';
import UserPage from './components/UserPage';
import LogInPage from './components/LogInPage';

function App(props) {
  if (props.location && props.location.hash) {
    console.log(props);
    const tokenArr = props.location.hash.split("&");
    if(tokenArr.length > 0) {
      const token = tokenArr[0].replace("#id_token=", "").replace("#access_token=", "")
      sessionStorage.setItem("token", token);
    }
  }
  const sessionToken = sessionStorage.getItem("token")
  const isValid =  sessionToken != undefined &&  sessionToken.length>0 ;
  console.log("IsValid", sessionToken);
  return (
    <Fragment>
         {isValid && 
         <UserPage></UserPage>
        } 
        {
          !isValid && 
          <LogInPage></LogInPage>
        }
    </Fragment>
  );
}
export default App;
