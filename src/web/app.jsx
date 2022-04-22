import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Routes, Route, Link, BrowserRouter, Navigate, useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";

import { Homepage, CreatePoll, ViewPoll } from "./pages";

export default function App(props) {
    const [showingErrorAlert, setShowingErrorAlert] = useState(false);
    const [errorContext, setErrorContext] = useState("");

    function showError(msg, delay = 30000) {
        setErrorContext(msg);
        setShowingErrorAlert(true);
        setTimeout(()=>setShowingErrorAlert(false), delay);
    }

    function clearError() {
        setShowingErrorAlert(false);
        setErrorContext("");
    }

    function displayModal() {
        if(showingErrorAlert == true) {
            return (
                <Alert variant="danger" onClose={() => setShowingErrorAlert(false)} dismissible>
                    <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                    <p>
                        You got this error when trying to perform that action: {errorContext}
                    </p>
                </Alert>
            );
        } else return;
    }

    return (
        <Container fluid className="p-3">
            <Row>
                <Col xs={12} md={8} className="offset-0 offset-md-2">
                    <h1>Poll - The Open-Source Poller</h1>
                    <hr />
                    {displayModal()}
                </Col>
            </Row>
            <BrowserRouter>
                <Routes>
                    <Route exact path="/" element={<Homepage clearError={clearError} />}></Route>
                    <Route exact path="" element={<Homepage clearError={clearError} />}></Route>

                    <Route path="/poll" element={<CreatePoll showError={showError} />}></Route>
                    <Route path="/poll/:pollID" element={<ViewPoll showError={showError} />}></Route>

                    <Route path="*" element={<Navigate to="/"></Navigate>}></Route>
                </Routes>
            </BrowserRouter>
            
        </Container>
    )
}