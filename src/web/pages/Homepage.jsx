import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

export function Homepage(props) {
    useEffect(()=>{
        props.clearError();
    }, []);

    return (
        <div>
            <Row>
                <Col xs={12} md={8} className="offset-0 offset-md-2">
                    <p>
                        Don't care about the project and just want to make a poll? No problem. 
                        <Link to="/poll" className="btn btn-warning mt-2 p-2 d-block w-50 w-md-25">Create a new poll</Link>
                    </p>
                </Col>
            </Row>
            <Row className="mt-5">
                <Col xs={12} md={8} className="offset-0 offset-md-2">
                    <h3>About the project</h3>
                    <hr />
                    <p>
                        The site you're on now is an open-source polling framework, built using NodeJS and Redis.
                        It was built as an open-source replacement for the popular StrawPoll, for people that no longer enjoy that site.
                        Votes on polls are restricted to a single vote per-IP, and are secured with ReCaptcha to limit botted submissions.
                    </p>
                    <p>
                        Benefits of this project being open-source is that if you don't like using the publically provided instance at <a href="https://poll.nullabyte.com">https://poll.nullabyte.com</a>, you can host it yourself on your own infrastructure!
                        Perfect for users with high-traffic polls that have the resources to pay for equally high-performance servers.
                    </p>
                    <p>
                        You can view the source code (including basic instructions on setup) <a href="#">at the GitHub repo</a>.
                        You can also raise issues on the repo if you encounter any bugs.
                    </p>
                    <p>
                        The publically provided instance does not run any advertisements nor analytics (excluding ReCaptcha) - the only thing you load is the tool.
                        Donations are appreciated to support the running of this instance, but are not required! <a href="#">View the details on the repo</a> for how to donate, if you're so inclined.
                    </p>
                </Col>
            </Row>
        </div>
    )
}