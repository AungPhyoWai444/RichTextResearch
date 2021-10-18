import './css/App.css';

// import DragEditor from "./dragAndDropEditor"
//import SimpleEmojiEditor from './testeditor/simpleEmojiEditor';
//import StaticToolBarEditor from './testeditor/staticToolBarEditor'
//import GoogleDrive from './googledrive/googledrive.js';
//import FileList from "./fileList.js"

import Login from "./login/login.js"
import RichEditor from "./note/rich-text-editor";
import { BrowserRouter as Router, Route, Switch,} from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path ="/" component={Login}/>
        <Route exact path ="/login" component={Login}/>
        <Route exact path ="/editor" component = {RichEditor}/>
      </Switch>  
    </Router>
  );
}
export default App;
