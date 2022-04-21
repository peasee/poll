import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import { useNavigate } from "react-router-dom";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import * as request from "../utilities/request";

export function CreatePollForm(props) {
    const [options, setOptions] = useState(["", ""]);
    const [title, setTitle] = useState("");

    const navigate = useNavigate();

    function updateTitle(e) {
        setTitle(e.target.value);
    }

    function addOrUpdateOption(index, e) {
        if(e.target.value == "" || e.target.value.length == 0) {
            options.splice(index, 1);
        } else {
            options[index] = e.target.value;
        }

        if(options[options.length - 1] !== "") {
            options.push("");
        }

        setOptions([...options]);
    }

    function renderPollOptions() {
        const displayOptions = [];

        for(let i=0; i<options.length; i++) {
            displayOptions.push((
                <Form.Group key={i} as={Row} className="mb-3" controlId="formPollOption1">
                    <Form.Label column sm={2}>Option #{i+1}</Form.Label>
                    <Col sm={10}>
                        <Form.Control type="text" placeholder={`Enter poll option #${i+1}`} value={options[i]} onChange={e=>addOrUpdateOption(i, e)} />
                    </Col>
                </Form.Group>
            ));
        }

        return displayOptions;
    }

    async function createPoll(e) {
        e.preventDefault();

        const body = {title, options};
        body.options = body.options.filter(o=>o!=="");
        const newPoll = await request.post("/poll", body);

        if(newPoll.error) {
            props.showError(newPoll.error);
            console.error(newPoll.error);
            return;
        }
        
        // redirect to the new poll to view it
        return navigate(`/poll/${newPoll.id}`);
    }

    return (
        <Row>
            <Col xs={6} className="offset-2">
                <Form onSubmit={createPoll}>
                    <Form.Group className="mb-3" controlId="formPollTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" placeholder="Enter poll title" onChange={updateTitle} value={title} />
                        <Form.Text className="text-muted">
                            What's your poll about?
                        </Form.Text>
                    </Form.Group>

                    {renderPollOptions()}
                    
                    <Button variant="warning" type="submit">
                        Create new poll
                    </Button>
                </Form>
            </Col>
        </Row>
    )
}