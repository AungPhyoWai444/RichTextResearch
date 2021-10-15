import './css/App.css';

// import DragEditor from "./dragAndDropEditor"
//import SimpleEmojiEditor from './testeditor/simpleEmojiEditor';
//import StaticToolBarEditor from './testeditor/staticToolBarEditor'
//import GoogleDrive from './googledrive/googledrive.js';
//import FileList from "./fileList.js"

import Login from "./note-function/login.js"
import RichEditor from "./rich-text-editor";
import { createBrowserHistory } from 'history' ;
import { BrowserRouter as Router, Route, Switch, Link} from "react-router-dom";
const history = createBrowserHistory()
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path ="/" component={Login}/>
        <Route exact path ="/login" component={Login}/>
        <Route exact path ="/editor" component = {RichEditor}/>
      </Switch>  
    </Router>
    // <div className="App">
    //   <Login />
    // </div>
  );
}

export default App;
