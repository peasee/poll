import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import ListItemText from '@material-ui/core/ListItemText';
import { get } from "./utils/request";
import { useNavigate } from "react-router-dom";

import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import { Routes, Route, Link, BrowserRouter, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

import CreateProject from "./pages/projects/create";
import DeleteProject from "./pages/projects/delete";
import ViewProject from "./pages/projects/view";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    appBar: {
      width: "100vw",
      backgroundColor: "#202020",
      marginLeft: 0,
      position: "fixed",
      zIndex: theme.zIndex.drawer + 5
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    backdrop: {
        color: "#fff",
        zIndex: theme.zIndex.drawer + 1
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
}));

export default function App(props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertText, setAlertText] = useState("");

    const classes = useStyles();

    useEffect(async ()=>{
        setOpenBackdrop(true);
        const result = await get(`/authentication/login/is`);

        if(result.authenticated === true) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }

        setOpenBackdrop(false);
    }, []);

    function logout() {
        setLoggedIn(false);
    }

    function toggleBackdrop(override) {
        setOpenBackdrop(override ?? !openBackdrop);
    }

    function handleAlertClose() {
        setOpenAlert(false);
    }

    function displayAlert(text) {
        setAlertText(text);
        setOpenAlert(true);
    }

    function loginRedirect(isLoggedIn) {
        if(isLoggedIn === true) return <Navigate to="/dashboard" replace></Navigate>
    
        return <Navigate to="/login" replace></Navigate>
    }
    
    function toolbarDisplay(isLoggedIn, username) {
        if(isLoggedIn === true) {
            return (
                <div>
                    <List>
                        <ListItem button component={Link} to={"/dashboard"} key="dashboard">
                            <ListItemIcon><DynamicFeedIcon></DynamicFeedIcon></ListItemIcon>
                            <ListItemText primary={"Dashboard"}></ListItemText>
                        </ListItem>
                        <ListItem button component={Link} to={"/billing"} key="billing">
                            <ListItemIcon><DynamicFeedIcon></DynamicFeedIcon></ListItemIcon>
                            <ListItemText primary={"Billing"}></ListItemText>
                        </ListItem>
                        <ListItem button component={Link} to={"/profile"} key="profile">
                            <ListItemIcon><DynamicFeedIcon></DynamicFeedIcon></ListItemIcon>
                            <ListItemText primary={"Profile"}></ListItemText>
                        </ListItem>
                    </List>
                </div>
            )
        } else {
            return undefined;
        }
    }

    return (
        <BrowserRouter>
            <Backdrop open={openBackdrop} className={classes.backdrop}>
                <CircularProgress color="inherit"></CircularProgress>
            </Backdrop>

            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleAlertClose}>
                <Alert severity="error" onClose={handleAlertClose}>An error occurred: {alertText}</Alert>
            </Snackbar>

            <div className={classes.root}>
                <CssBaseline></CssBaseline>

                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            nPanel
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Drawer className={classes.drawer} variant="permanent" classes={{paper: classes.drawerPaper}} anchor="left">
                    <div className={classes.toolbar}></div>
                    <Divider></Divider>
                    {toolbarDisplay(loggedIn, username)}
                </Drawer>

                <main className={classes.content}>
                    <div className={classes.toolbar}></div>
                    <Routes>
                        <Route exact path="/" element={loginRedirect(loggedIn)}></Route>
                        <Route exact path="" element={loginRedirect(loggedIn)}></Route>

                        <Route path="/dashboard" element={<Dashboard logout={logout} loggedIn={loggedIn} toggleBackdrop={toggleBackdrop} displayAlert={displayAlert} username={username} setUsername={setUsername} />}></Route>
                        <Route path="/projects/new" element={<CreateProject loggedIn={loggedIn} toggleBackdrop={toggleBackdrop} displayAlert={displayAlert} username={username} setUsername={setUsername} />}></Route>
                        <Route path="/projects/:projectID" element={<ViewProject loggedIn={loggedIn} toggleBackdrop={toggleBackdrop} displayAlert={displayAlert} username={username} setUsername={setUsername} />}></Route>
                        <Route path="/projects/:projectID/delete" element={<DeleteProject loggedIn={loggedIn} toggleBackdrop={toggleBackdrop} displayAlert={displayAlert} username={username} setUsername={setUsername} />}></Route>

                        <Route path="/login" element={<Login loggedIn={loggedIn} toggleBackdrop={toggleBackdrop} setLoggedIn={setLoggedIn} setUsername={setUsername} displayAlert={displayAlert} />}></Route>
                        <Route path="*" element={<Navigate to="/login"></Navigate>}></Route>
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}