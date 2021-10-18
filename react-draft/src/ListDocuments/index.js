import React, { useCallback } from 'react';
import moment from 'moment';
import { debounce } from 'lodash';
import RichEditorExample from '../note/rich-text-editor';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Col, Drawer, Row, Button, Input, Table, Tooltip } from 'antd';
const { Search } = Input;

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Last Modified Date',
    dataIndex: 'modifiedTime',
    key: 'modifiedTime',
    render: (text) => <span>{moment(text).format('Do MMM YYYY HH:mm A')}</span>,
  },
  {
    title: 'Action',
    key: 'status',
    dataIndex: 'status',
    render: (tag) => (
      <span>
        <Tooltip title="View Document">
          <Button type="primary" ghost>
            Select
          </Button>
        </Tooltip>
      </span>
    ),
  },
];
const ListDocuments = ({ visible, onClose, documents = [], onSearch, signedInUser, onSignOut, isLoading }) => {
  const search = (value) => {
    delayedQuery(`name contains '${value}'`);
  };

  const delayedQuery = useCallback(
    debounce((q) => onSearch(q), 500),
    []
  );
  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(documents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

 //   updateCharacters(items);
  }
  return (
    <Drawer
      title="Select Google Drive Document"
      placement="right"
      closable
      onClose={onClose}
      visible={visible}
      width={900}
    >
      <Row>
        <RichEditorExample />
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <div style={{ marginBottom: 20 }}>
            <p>Signed In as: User</p>
            <Button type="primary" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
          <div className="table-card-actions-container">
            <div className="table-search-container">
              <Search
                placeholder="Search Google Drive"
                onChange={(e) => search(e.target.value)}
                onSearch={(value) => search(value)}
                className="table-search-input"
                size="large"
                enterButton
              />
            </div>
          </div>
          {/* <DragDropContext onDragEnd={handleOnDragEnd}>
          <Draggable>  */}
            <Table
            className="table-striped-rows"
            columns={columns}
            dataSource={documents}
            pagination={{ simple: true }}
            loading={isLoading}
          />
         {/* </Draggable> </DragDropContext> */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="documents">
            {(provided) => (
              <ul className="documents" {...provided.droppableProps} ref={provided.innerRef}>
                {documents.map(({id, name, thumb}, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                         
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
        </DragDropContext>
        </Col>
      </Row>
    </Drawer>
  );
};

export default ListDocuments;