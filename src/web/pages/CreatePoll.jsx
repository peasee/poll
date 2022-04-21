import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { CreatePollForm } from "../components";

export function CreatePoll(props) {
    return (
        <div>
            <Row>
                <Col xs={8} className="offset-2 mt-1 mb-3">
                    <Link to="/">Take me home!</Link>
                </Col>
            </Row>
            <Row>
                <Col xs={8} className="offset-2">
                    <h4>Create a new poll</h4>
                    <p>
                        Fill out the form information below to make a new poll!
                        All you need is a title and some form options.
                    </p>
                </Col>
            </Row>
            <CreatePollForm showError={props.showError}></CreatePollForm>
        </div>
    )
}