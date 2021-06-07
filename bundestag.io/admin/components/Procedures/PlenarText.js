import React from 'react'

const replaceText = (text, strPart, color) => {
    return text.replaceAll(strPart, `<span style="background-color: ${color}">${strPart}</span>`)
}

const replaceParties = (text) => {
    let outText = [
        ["Grüne", "#abffb3"], 
        ["Linke", "#fa9db0"],
        ["CDU", "#d1c9ca"],
        ["CSU", "#d1c9ca"],
        ["Union", "#d1c9ca"],
        ["FDP", "#f8ffa6"],
        ["AfD", "#94fff8"],
        ["SPD", "#fab59d"],
        ["alle übrigen", "#ffe1a1"],
    ].reduce((prev, p) => {
        return replaceText(prev, p[0], p[1])
    }, text)
    return outText;
}

const replaceVoteKeywords = (text) => {
    const returnText = ["abgelehnt", "angenommen"].reduce((prev, docId) => {
        return replaceText(prev, docId, "#ff42e0")
    }, text)
    return returnText;
}

const replaceDocNumbers = (text, docIds) => {
    const returnText = docIds.reduce((prev, docId) => {
        return replaceText(prev, docId, "#ff42e0")
    }, text)
    return returnText;
}

const PlenarText = ({text, docIds}) => {
    let outText = replaceParties(text);
    outText = replaceVoteKeywords(outText);
    outText = replaceDocNumbers(outText, docIds);
    return (
        <div dangerouslySetInnerHTML={{__html: outText }} style={{paddingBottom: "10px"}} />
    )
}

export default PlenarText
