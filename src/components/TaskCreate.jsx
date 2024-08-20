import React, { useState, useRef, useEffect, useCallback } from 'react';
import './taskcreate.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import deleteicon from '../assets/delete.png';
import closebutton from '../assets/close.png';
import message from '../assets/messenger.png';
import drag from '../assets/drag.png';
import TaskList from './TaskList';
import moment from 'moment';
import CustomSelect from './CustomSelect';
import WorkType from './WorkType';
import FileUpload from './FileUpload';

function TaskCreate() {
  const [inputValue, setInputValue] = useState('');
  const [tasks, setTasks] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const editableInputRef = useRef(null);
  const containerRef = useRef(null);

  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F33FF5', '#F5A623'];

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) {
        setIsSaving(true);
        saveAllData();
      }
    };

    const handleClick = (event) => {
      if (!containerRef.current.contains(event.target)) {
        saveAllData();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('mousedown', handleClick);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [isSaving]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      editableInputRef.current.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      saveAllData();
    }
  };

  const createNewTask = (initialChar) => {
    const newTask = {
      text: initialChar,
      completed: false,
      datetime: null,
      label: '',
      ref: React.createRef(),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setTimeout(() => {
      newTask.ref.current.focus();
    }, 0);
  };

  const handleTaskKeyDown = (index, event) => {
    if (event.key === 'Escape' && !isSaving) {
      setIsSaving(true);
      saveAllData();
      return;
    }
    if (event.key === 'Backspace' && tasks[index].text === '') {
      event.preventDefault();
      handleDeleteTask(index);
      if (index > 0) {
        tasks[index - 1].ref.current.focus();
      } else if (tasks.length > 0) {
        editableInputRef.current.focus();
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (index < tasks.length - 1) {
        createNewTaskAtIndex(index + 1);
      } else {
        editableInputRef.current.focus();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index > 0) {
        tasks[index - 1].ref.current.focus();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (index < tasks.length - 1) {
        tasks[index + 1].ref.current.focus();
      } else {
        editableInputRef.current.focus();
      }
    }
  };
  
  const handleEditableKeyDown = (event) => {
    if (event.key === 'Escape' && !isSaving) {
      setIsSaving(true);
      saveAllData();
      return;
    }
    if (event.key === 'Backspace' && tasks.length > 0) {
      event.preventDefault();
      const lastTask = tasks[tasks.length - 1];
      if (lastTask.text === '') {
        handleDeleteTask(tasks.length - 1);
      } else {
        lastTask.ref.current.focus();
      }
    } else if (event.key === 'ArrowUp' && tasks.length > 0) {
      event.preventDefault();
      tasks[tasks.length - 1].ref.current.focus();
    } else if (event.key !== 'Enter' && /^[a-zA-Z0-9`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]$/.test(event.key)) {
      event.preventDefault();
      createNewTask(event.key);
    }
  };

  
  const createNewTaskAtIndex = (index) => {
    const newTask = {
      text: '',
      completed: false,
      datetime: null,
      label: '',
      ref: React.createRef(),
    };
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      newTasks.splice(index, 0, newTask);
      return newTasks;
    });
    setTimeout(() => {
      newTask.ref.current.focus();
    }, 0);
  };
  
  

  const handleTaskChange = (index, event) => {
    const newTasks = [...tasks];
    newTasks[index].text = event.target.value;
    setTasks(newTasks);
  };

  const handleDatetimeChange = (index, datetime) => {
    const newTasks = [...tasks];
    newTasks[index].datetime = datetime;
    setTasks(newTasks);
  };

  const handleLabelChange = (index, tags) => {
    const newTasks = [...tasks];
    newTasks[index].selectedTags = tags;
    setTasks(newTasks);
  };
  

  const handleDeleteTask = (index) => {
    setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
  };

  const handleTaskCheck = (cardIndex, taskIndex, isChecked) => {
    if (cardIndex === null) {
      // Handle for newly created tasks
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks];
        if (newTasks[taskIndex]) {
          newTasks[taskIndex].completed = isChecked;
          if (isChecked) {
            const completedTask = newTasks.splice(taskIndex, 1)[0];
            newTasks.push(completedTask);
          }
        }
        return newTasks;
      });
    } else {
      // Handle for saved items
      setSavedItems((prevItems) => {
        const newItems = [...prevItems];
        const card = newItems[cardIndex];
    
        if (card && card.items && card.items[taskIndex]) {
          card.items[taskIndex].completed = isChecked;
          if (isChecked) {
            const completedTask = card.items.splice(taskIndex, 1)[0];
            card.items.push(completedTask);
          }
        }
    
        return newItems;
      });
    }
  };
  
  
  const handleTaskDragStart = (e, cardIndex, taskIndex) => {
    setDraggingIndex({ cardIndex, taskIndex });
};

  const handleTaskDragOver = (e) => {
    e.preventDefault();
  };

  const handleTaskDrop = (e, cardIndex, targetTaskIndex) => {
    e.preventDefault();
    if (draggingIndex && draggingIndex.cardIndex === cardIndex && draggingIndex.taskIndex !== targetTaskIndex) {
      if (cardIndex === null) {
        setTasks((prevTasks) => {
          const newTasks = [...prevTasks];
          const [movedTask] = newTasks.splice(draggingIndex.taskIndex, 1);
          newTasks.splice(targetTaskIndex, 0, movedTask);
          return newTasks;
        });
      } else {
        setSavedItems((prevItems) => {
          const newItems = [...prevItems];
          const tasks = newItems[cardIndex].items;
          const [movedTask] = tasks.splice(draggingIndex.taskIndex, 1);
          tasks.splice(targetTaskIndex, 0, movedTask);
          return newItems;
        });
      }
      setDraggingIndex(null);
    }
  };
  

  const saveAllData = useCallback(() => {
    const dataToSave = {
      title: inputValue.trim(),
      items: tasks
        .map((task) => ({
          text: task.text.trim(),
          completed: task.completed,
          datetime: task.datetime,
          selectedTags: task.selectedTags || [],
        }))
        .filter((item) => item.text !== '' || item.datetime || item.selectedTags.length > 0),
    };
    if (dataToSave.title || dataToSave.items.length > 0) {
      setSavedItems((prevItems) => [...prevItems, dataToSave]);
      setTasks([]);
      setInputValue('');
      if (editableInputRef.current) editableInputRef.current.value = '';
      document.getElementById('inputField').focus();
    }
    setIsSaving(false);
  }, [tasks, inputValue]);
  
  

  const handleEditTask = (itemIndex) => {
    if (tasks.length > 0 || inputValue.trim()) {
      saveAllData();
    }
  
    const item = savedItems[itemIndex];
    setInputValue(item.title);
    setTasks(
      item.items.map((task) => ({
        ...task,
        ref: React.createRef(),
        selectedTags: task.selectedTags || [],
      }))
    );
  
    setSavedItems((prevItems) => prevItems.filter((_, index) => index !== itemIndex));
    document.getElementById('inputField').focus();
  };
  
  

  return (
    <div className="main_div">
      <div ref={containerRef} className="container">
        <button className="close_button" onClick={saveAllData}>
          <img src={closebutton} className="close_icon" height={15} width={15} />
        </button>
        <input
          className="title_input"
          type="text"
          id="inputField"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          autoFocus={true}
          placeholder="Title"
        />

        <div className="editable-div-container">
          {tasks.map((task, index) => (
            <div
              key={index}
              className={`new-div`}
              draggable
              onDragStart={(e) => handleTaskDragStart(e,null, index)}
              onDragOver={handleTaskDragOver}
              onDrop={(e) => handleTaskDrop(e, null,index)}
            >
              <img className="drag_image_logo" src={drag} height={20} width={20} alt="drag" />
              <input
                type="checkbox"
                className="new-div-checkbox"
                checked={task.completed || false}
                onChange={(e) => handleTaskCheck(null, index, e.target.checked)}
              />
              <input
                type="text"
                value={task.text}
                onChange={(e) => handleTaskChange(index, e)}
                onKeyDown={(e) => handleTaskKeyDown(index, e)}
                ref={task.ref}
                className="new-div-input"
              />
              
              <CustomSelect
                selectedTags={task.selectedTags} 
                onSelectTags={(tags) => handleLabelChange(index, tags)}
              />
                
              <div id ='icon_div'>
                <div>
                  <TaskList
                    dateTime={task.datetime}
                    onDatetimeChange={(newDatetime) => handleDatetimeChange(index, newDatetime)}
                    onKeyDown={(e) => handleTaskKeyDown(index, e)}
                  />
                </div>
                <div className='timer_inp'>
                  <WorkType/>
                </div>
                <div>
                  <FileUpload/>
                </div>
                <div>
                  <img src={message} alt='message' className='message_icon'/>
                </div>
              </div>

              <button className="delete-button" onClick={() => handleDeleteTask(index)}>
                <img src={deleteicon} className="cross_button" height={30} width={30} />
              </button>
            </div>
          ))}
          <div className="editable-input-container">
            <FontAwesomeIcon icon={faPlus} className="plus-icon" />
            <input
              id="editableInput"
              ref={editableInputRef}
              type="text"
              onKeyDown={handleEditableKeyDown}
              placeholder="Add Task"
              style={{
                padding: '5px',
                minHeight: '20px',
                width: '100%',
                outline: 'none',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>
      <div className="saved-items">
        {savedItems.map((item, itemIndex) => (
          <div key={itemIndex} 
               className="card">
            <h1 onClick={() => handleEditTask(itemIndex)}>{item.title}</h1>
            {item.items.map((task, index) => (
              <div
                key={index}
                className={`card-item ${draggingIndex && draggingIndex.cardIndex === itemIndex && draggingIndex.taskIndex === index ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleTaskDragStart(e,itemIndex, index)}
                onDragOver={handleTaskDragOver}
                onDrop={(e) => handleTaskDrop(e,itemIndex,  index)}
                onDragEnd={() => setDraggingIndex(null)}
              >
                <img className="drag_image_logo" src={drag} height={20} width={20} alt="drag" />
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={(e) => handleTaskCheck(itemIndex, index, e.target.checked)}
                />
                <div className="task-content">
                  <p style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.text}
                  </p>                 
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskCreate;
