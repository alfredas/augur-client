/**
 * Autogenerated from https://github.com/tinybike/augur-serpent/tree/master/serpent/data%20and%20api%20files
 * serpent mk_full_signature events.se
 */
module.exports = [{
    "name": "getEventBranch(int256)",
    "type": "function",
    "inputs": [{ "name": "event", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "getEventInfo(int256)",
    "type": "function",
    "inputs": [{ "name": "event", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256[]" }]
},
{
    "name": "getExpiration(int256)",
    "type": "function",
    "inputs": [{ "name": "event", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "getMaxValue(int256)",
    "type": "function",
    "inputs": [{ "name": "event", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "getMinValue(int256)",
    "type": "function",
    "inputs": [{ "name": "event", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "getNumOutcomes(int256)",
    "type": "function",
    "inputs": [{ "name": "event", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "getOutcome(int256)",
    "type": "function",
    "inputs": [{ "name": "event", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "initializeEvent(int256,int256,int256,int256,int256,int256)",
    "type": "function",
    "inputs": [{ "name": "ID", "type": "int256" }, { "name": "branch", "type": "int256" }, { "name": "expirationDate", "type": "int256" }, { "name": "minValue", "type": "int256" }, { "name": "maxValue", "type": "int256" }, { "name": "numOutcomes", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "setOutcome(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "ID", "type": "int256" }, { "name": "outcome", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
}];
