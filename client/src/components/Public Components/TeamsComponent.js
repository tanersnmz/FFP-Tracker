import Plot from "react-plotly.js";
import { useState, useEffect } from "react";
import FFP_API from "../../app/api";
import CircularProgressComponent from "./CircularProgressComponent";
import { Typography } from "@mui/material";

export default function TeamsComponent() {
  const [teams, setTeams] = useState(null);
  const [revenues, setRevenues] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await FFP_API.get("/teams/data").then((res) => {
        setTeams(res.data.teams);
        setRevenues(res.data.revenues);
        setExpenses(res.data.expenses);
      });
      setLoading(false);
    };
    if (loading) fetchData();
  });

  function plot(team, revenues, expenses) {
    let index;
    for (let i = 0; i < revenues.length; i++) {
      if (revenues[i].teamId === team._id) {
        index = i;
        break;
      }
    }
    const revs = revenues[index];
    for (let i = 0; i < expenses.length; i++) {
      if (expenses[i].teamId === team._id) {
        index = i;
        break;
      }
    }
    const exps = expenses[index];
    let months = [];
    let rev = [];
    let cumRev = [];
    for (const [key, value] of Object.entries(revs.ticketing)) {
      months.push(String(key));
      rev.push(value + revs.marketing[key] + revs.broadcasting[key]);
      if (cumRev.length === 0) {
        cumRev.push(value + revs.marketing[key] + revs.broadcasting[key]);
      } else {
        cumRev.push(
          value +
            revs.marketing[key] +
            revs.broadcasting[key] +
            cumRev[cumRev.length - 1]
        );
      }
    }
    let exp = [];
    let cumExp = [];
    for (const [key, value] of Object.entries(exps.salaries)) {
      exp.push(value + exps.amortization[key] + exps.operational[key]);
      if (cumExp.length === 0) {
        cumExp.push(value + exps.amortization[key] + exps.operational[key]);
      } else {
        cumExp.push(
          value +
            exps.amortization[key] +
            exps.operational[key] +
            cumExp[cumExp.length - 1]
        );
      }
    }
    const plotContent = (
      <Plot
        key={team._id}
        data={[
          {
            type: "bar",
            x: months,
            y: rev,
            name: "Monthly Revenues",
          },
          {
            type: "bar",
            x: months,
            y: exp,
            name: "Monthly Expenses",
          },
          {
            type: "line",
            x: months,
            y: cumExp,
            name: "Cumulative Expenses",
          },
          {
            type: "line",
            x: months,
            y: cumRev,
            name: "Cumulative Revenues",
          },
        ]}
        layout={{
          width: 400,
          height: 300,
          title: `<a href = "/teams/${team._id}" target = "_self">${team.teamName}</a>`,
          yaxis: {
            title: "Amount in Million TLs",
          },
          xaxis: {
            title: "Months",
          },
        }}
      />
    );
    return plotContent;
  }
  const content = (
    <>
      <Typography variant="h4" align="center" sx={{ mt: 4 }}>
        All Teams in Super League
      </Typography>
      <div>
        {!loading ? (
          teams.map((team) => {
            return plot(team, revenues, expenses);
          })
        ) : (
          <CircularProgressComponent />
        )}
      </div>
    </>
  );
  return content;
}