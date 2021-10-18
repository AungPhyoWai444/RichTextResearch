import React, { useState } from 'react';
import { Row, Col, Spin } from 'antd';
import styled from 'styled-components';
import { gapi } from 'gapi-script';
import GoogleDriveImage from '../images/google-drive.png';
import ListDocuments from '../ListDocuments';
import { style } from './style';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Client ID and API key from the Developer Console
const CLIENT_ID = "547330562057-i3ohfddt12lrmcq4dsljk6qmmcgt4t90.apps.googleusercontent.com";
const API_KEY = "AIzaSyDo9MQj6u3Eftj5Acd9QoY_1BieZDRZ0O8";

// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES ='https://www.googleapis.com/auth/drive.metadata.readonly';

const Login = () => {
  const [listDocumentsVisible, setListDocumentsVisibility] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] = useState(false);
  const [signedInUser, setSignedInUser] = useState();
  const handleChange = (file) => {};

  /**
   * Print files.
   */
  const listFiles = (searchTerm = null) => {
    setIsFetchingGoogleDriveFiles(true);
    gapi.client.drive.files
      .list({
        pageSize: 50,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
        q: searchTerm,
      })
      .then(function (response) {
        setIsFetchingGoogleDriveFiles(false);
        setListDocumentsVisibility(true);
        const res = JSON.parse(response.body);
        setDocuments(res.files);
      });
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = (event) => {
    gapi.auth2.getAuthInstance().signIn();
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  const updateSigninStatus = (isSignedIn) => {
    if (isSignedIn) {
      // Set the signed in user
      setSignedInUser(gapi.auth2.getAuthInstance().currentUser.get().dt);
      setIsLoadingGoogleDriveApi(false);
      // list files if user is authenticated
      listFiles();
    } else {
      // prompt user to sign in
      handleAuthClick();
    }
  };

  /**
   *  Sign out the user upon button click.
   */
  const handleSignOutClick = (event) => {
    setListDocumentsVisibility(false);
    gapi.auth2.getAuthInstance().signOut();
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  const initClient = () => {
    setIsLoadingGoogleDriveApi(true);
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error) {}
      );
  };

  const handleClientLoad = () => {
    gapi.load('client:auth2', initClient);
  };

  const showDocuments = () => {
    setListDocumentsVisibility(true);
  };

  const onClose = () => {
    setListDocumentsVisibility(false);
  };

  const divStyle={
    overflowY: 'scroll',
    border:'1px solid red',
    width:'100%',
    float: 'center',
    position:'relative'
  };
  const finalSpaceCharacters = [
    {
      id: 'gary',
      name: 'Gary Goodspeed',
      thumb: '/images/gary.png'
    },
    {
      id: 'cato',
      name: 'Little Cato',
      thumb: '/images/cato.png'
    },
    {
      id: 'kvn',
      name: 'KVN',
      thumb: '/images/kvn.png'
    },
    {
      id: 'mooncake',
      name: 'Mooncake',
      thumb: '/images/mooncake.png'
    },
    {
      id: 'quinn',
      name: 'Quinn Ergon',
      thumb: '/images/quinn.png'
    }
  ]
  const [characters, updateCharacters] = useState(finalSpaceCharacters);
  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(characters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateCharacters(items);
  }
  return (
    <div style={divStyle}>
      <Row gutter={16} className="custom-row" >
        <Col span={8}>
          <Spin spinning={isLoadingGoogleDriveApi} style={{ width: '50%' ,height:'20%'}}>
            <div onClick={() => handleClientLoad()} className="source-container">
              <div className="icon-container">
                <div className="icon icon-success">
                  <img src={GoogleDriveImage} width="200" height="200"/>
                </div>
              </div>
            </div>
          </Spin>
        </Col>
      </Row>
      {/* <DragDropContext onDragEnd={handleOnDragEnd}>

          <Droppable droppableId="characters">
            {(provided) => (
              <ul className="characters" {...provided.droppableProps} ref={provided.innerRef}>
                {documents.map(({id, name, thumb}, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div className="characters-thumb">
                            <img src={thumb} alt={`${name} Thumb`} />
                          </div>
                          <p>
                            { name }
                          </p>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
              // <Draggable key={id} draggableId={id} index={index}>
              //   {(provided)=>(
              //       <ListDocuments className="characters"
              //       visible={listDocumentsVisible}
              //       onClose={onClose}
              //       documents={documents}
              //       onSearch={listFiles}
              //       signedInUser={signedInUser}
              //       onSignOut={handleSignOutClick}
              //       isLoading={isFetchingGoogleDriveFiles}
              //     />
              //   )}
              // </Draggable>
            )}
          </Droppable>
        </DragDropContext> */}
         <ListDocuments className="characters"
                    visible={listDocumentsVisible}
                    onClose={onClose}
                    documents={documents}
                    onSearch={listFiles}
                    signedInUser={signedInUser}
                    onSignOut={handleSignOutClick}
                    isLoading={isFetchingGoogleDriveFiles}
                  />
    </div>
  );
};

export default Login;
