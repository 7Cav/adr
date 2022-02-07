/* TODO:

- Reorganize this terribleness into something more streamlined
- Wait for jarvis to update the API so that sort order is properly displayed
- Look into sorting by rank after sorting by billet (Subsorting? QuickSort maybe?)
- Styling
- Line Billets
- Search Bar/Collapsable Divs
- Maybe a loading screen?
- General Code Cleanup
- Fix these fucking errors that throw up over list keys

*/


import React, {useEffect, useState} from 'react';
import './App.css';

import WAGList from './modules/IMO/WAG.js';
import S1List from './modules/IMO/S1.js';
import S6List from './modules/IMO/S6.js';
import IMOStaffList from './modules/IMO/Command.js';

import JAGList from './modules/SecOps/JAG.js';
import MPList from './modules/SecOps/MP.js';
import S2List from './modules/SecOps/S2.js';
import SecOpsList from './modules/SecOps/Command.js';

import ROOStaffList from './modules/ROO/Command.js';
import RRDList from './modules/ROO/RRD.js';
import RTCList from './modules/ROO/RTC.js';
import S5List from './modules/ROO/S5.js';

import S3List from './modules/Support/S3.js';
import S7List from './modules/Support/S7.js';
import SPDList from './modules/Support/SPD.js';


function MilpacRequest () {

  const [milpacList, setMilpacList] = useState ([]);
  const [reserveList, setReserveList] = useState ([]);
  
  useEffect(() => {
      async function fetchMilpacList() {
          try {
              const requestUrl = 'http://localhost:4000/roster/combat'
              const response = await fetch (requestUrl);
              const responseJSON = await response.json();
              setMilpacList(responseJSON);
          } catch {

          }
      } 
   fetchMilpacList();
  },[]);

  useEffect(() => {
    async function fetchReserveList() {
        try {
            const requestUrl = 'http://localhost:4000/roster/reserves'
            const response = await fetch (requestUrl);
            const responseJSON = await response.json();
            setReserveList(responseJSON);
        } catch {

        }
    } 
    fetchReserveList();
  },[]);

  var listArray = []
  listArray.push({
    "combat": milpacList,
    "reserve": reserveList
  })

  return(
  <div className='MasterContainer'>
    <div className='17Container'>
      <div className='17Title'>
        <h1>First Battalion</h1>
      </div>
      <h2>Work in progress...</h2>
    </div>
    <div className='27Container'>
      <div className='27Title'>
        <h1>2nd Battalion</h1>
      </div>
      <h2>Work in progress...</h2>
    </div>
    <div className='ACDContainer'>
      <div className='ACDTitle'>
        <h1>Auxillary Combat Division</h1>
      </div>
      <h2>Work in progress...</h2>
    </div>
    <div className='IMOContainer'>
      <div className='IMOTitle'>
        <h1> Information Managment Office</h1>
      </div>
      <IMOStaffList listArray = {listArray}/>
      <WAGList listArray = {listArray}/>
      <S1List listArray = {listArray}/>
      <S6List listArray = {listArray}/>
    </div>
    <div className='SecOpsContainer'>
      <div className='SecOpsTitle'>
        <h1>Security Operations Department</h1>
      </div>
      <SecOpsList listArray = {listArray}/>
      <JAGList listArray = {listArray}/>
      <S2List listArray = {listArray}/>
      <MPList listArray = {listArray}/>
    </div>
    <div className='ROOContainer'>
      <div className='ROOTitle'>
        <h1>Recruitment Oversight Office</h1>
      </div>
      <ROOStaffList listArray = {listArray}/>
      <RRDList listArray = {listArray}/>
      <RTCList listArray = {listArray}/>
      <S5List listArray = {listArray}/>
    </div>
    <div className='SupportContainer'>
      <div className='SupportTitle'>
        <h1>Support Depatments</h1>
      </div>
      <S3List listArray = {listArray}/>
      <S7List listArray = {listArray}/>
      <SPDList listArray = {listArray}/>
    </div>
  </div> 
  )
}
export default MilpacRequest; 
