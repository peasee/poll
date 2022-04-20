import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Routes, Route, Link, BrowserRouter, Navigate, useNavigate } from "react-router-dom";

import { Homepage } from "./pages";

export default function App(props) {
    const classes = useStyles(classesObject);

    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Homepage />}></Route>
                <Route exact path="" element={<Homepage />}></Route>

                <Route path="*" element={<Navigate to="/"></Navigate>}></Route>
            </Routes>
        </BrowserRouter>
    )
}