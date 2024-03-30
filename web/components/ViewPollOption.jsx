import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import Col from "react-bootstrap/Col";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";

import * as request from "../utilities/request";

export function ViewPollOption(props) {
    const ratio = props.totalVotes > 0 ? (Math.floor((props.option.count / props.totalVotes) * 10000) / 100).toFixed(2) : "0.00";

    async function vote(e) {
        e.preventDefault();

        const recap = await request.captcha("vote");
        const voteResult = await request.post(`/poll/${props.pollID}/vote`, {option: props.optionID, recap});

        if(voteResult.error) {
            props.showError(voteResult.error);
            console.error(voteResult.error);
            return;
        }

        return props.voted();
    }

    function displayVoteButton() {
        if(props.hasVoted == false) {
            return <Button variant="info" className="btn-sm pb-0 pt-0 ps-3 pe-3" onClick={vote}>Vote</Button>;
        }

        return;
    }

    return (
        <Col xs={12} className="p-1 mb-1 mt-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="d-inline-block">{props.option.prompt}</h6>
                <span className="small d-inline-block">{props.option.count} - {ratio}%</span>
                {displayVoteButton()}
            </div>
            <ProgressBar style={{height: "30px"}}>
                <ProgressBar style={{backgroundColor: props.option.color}} now={ratio} max={100}></ProgressBar>
            </ProgressBar>
        </Col>
    )
}