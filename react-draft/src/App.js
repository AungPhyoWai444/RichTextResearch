import './css/App.css';
 //import RichEditor from "./rich-text-editor";
// import DragEditor from "./dragAndDropEditor"
//import SimpleEmojiEditor from './testeditor/simpleEmojiEditor';
//import StaticToolBarEditor from './testeditor/staticToolBarEditor'
import GoogleDrive from './googledrive/googledrive.js';
//import FileList from "./fileList.js"
function App() {
  return (
    <div className="App">
      <GoogleDrive />
    </div>
  );
}

export default App;
