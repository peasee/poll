import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import { PieChart } from "react-minimal-pie-chart";

export function ViewPollPie(props) {
    const pieData = props.options.map(o=>{
        return {
            title: o.prompt,
            value: o.count,
            color: o.color
        };
    });

    if(props.totalVotes > 0)
        return (
            <div>
                <PieChart data={pieData} radius={40}></PieChart>
            </div>
        )
    
    return (
        <div>
            <h4>There aren't any votes yet!</h4>
        </div>
    )
}