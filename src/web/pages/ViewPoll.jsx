import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import { Link } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { useParams } from "react-router-dom";
import { ViewPollOption, ViewPollPie } from "../components";

import * as request from "../utilities/request";

export function ViewPoll(props) {
    const [title, setTitle] = useState("Loading poll...");
    const [options, setOptions] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);

    const [hasVoted, setHasVoted] = useState(false);
    const [intervalID, setIntervalID] = useState(0);

    const { pollID } = useParams();

    useEffect(()=>{
        setIntervalID(setInterval(()=>updateOptionCount(), 5000));
        loadInitialPollData();

        const hasVotedKey = localStorage.getItem(pollID);
        setHasVoted(hasVotedKey !== null);
    }, []);

    function voted() {
        setHasVoted(true);
        localStorage.setItem(pollID, "voted");
    }

    function randomColor() {
        return "#" + new Array(6).fill(undefined).map(()=>(Math.floor(Math.random()*14)+2).toString(16)).join("");
    }

    async function loadInitialPollData() {
        const data = await request.get(`/poll/${pollID}`);

        if(data.error) {
            props.showError(data.error);
            setIntervalID(id=>{
                clearInterval(id);
                return id;
            });
            return;
        }

        let totalVotes = 0;
        const options = [];
        for(let i=1; i<Number(data.optionCount)+1; i++) {
            const opt = {
                count: Number(data[`${i}:count`]),
                prompt: data[`${i}:prompt`],
                color: randomColor()
            };

            totalVotes += opt.count;
            options.push(opt);
        }

        setTitle(data.title);
        setTotalVotes(totalVotes);
        setOptions([...options]);
    }

    async function updateOptionCount() {
        try {
            const data = await request.get(`/poll/${pollID}/options`);
            if(data.error) {
                props.showError(data.error);
                setIntervalID(id=>{
                    clearInterval(id);
                    return id;
                });
                return;
            }
            
            setOptions(options => {
                let totalVotes = 0;
                for(let i=0; i<Object.keys(data).length; i++) {
                    const k = Number(Object.keys(data)[i]);
                    options[k-1].count = Number(data[k]);
                    totalVotes += Number(data[k]);
                }

                setTotalVotes(totalVotes);
                return [...options];
            });
        } catch (err) {
            props.showError(data.error);
            clearInterval(intervalID);
        }
    }

    return (
        <div>

            <Row>
                <Col xs={8} className="offset-2 mt-1 mb-5">
                    <Link to="/">Take me home!</Link>
                </Col>
            </Row>
            <Row>
                <Col xs={8} className="offset-2 mt-4">
                    <h4 className="d-block">{title}</h4>
                    <a href={`/poll/${pollID}`}>Share this link</a>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col xs={8} className="offset-2 border rounded p-4">
                    <Container fluid>
                        <Row>
                            <Col xs={6} className="d-flex flex-column justify-content-evenly">
                                <div>
                                    <h4>Total Votes: {totalVotes}</h4>
                                    <span className="small text-muted">Results update every 5 seconds</span>
                                </div>
                                {(options ?? []).map((o, i)=><ViewPollOption
                                    key={i}
                                    voted={voted}
                                    pollID={pollID}
                                    optionID={i+1}
                                    option={o}
                                    totalVotes={totalVotes}
                                    hasVoted={hasVoted}
                                    showError={props.showError}>
                                </ViewPollOption>)}
                            </Col>
                            <Col xs={6} className="d-flex flex-column justify-content-center">
                                <ViewPollPie options={options} totalVotes={totalVotes}></ViewPollPie>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </div>
    )
}