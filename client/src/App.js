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

//Command Billets
import RCommandList from './modules/Regi/Command';

//1-7 Billets
import Command1List from './modules/1-7/Command';
import Alpha1List from './modules/1-7/Alpha';
import Bravo1List from './modules/1-7/Bravo';
import Charlie1List from './modules/1-7/Charlie';

//2-7 Billets
import Command2List from './modules/2-7/Command';
import Alpha2List from './modules/2-7/Alpha';
import Bravo2List from './modules/2-7/Bravo';
import Charlie2List from './modules/2-7/Charlie';

//ACD Billets
import Command3List from './modules/ACD/Command';
import Alpha3List from './modules/ACD/Alpha';
import Bravo3List from './modules/ACD/Bravo';
import Charlie3List from './modules/ACD/Charlie';
import Delta3List from './modules/ACD/Delta';
import Echo3List from './modules/ACD/Echo';

//IMO Billets
import WAGList from './modules/IMO/WAG.js';
import S1List from './modules/IMO/S1.js';
import S6List from './modules/IMO/S6.js';
import IMOStaffList from './modules/IMO/Command.js';

//SecOps Billets
import JAGList from './modules/SecOps/JAG.js';
import MPList from './modules/SecOps/MP.js';
import S2List from './modules/SecOps/S2.js';
import SecOpsList from './modules/SecOps/Command.js';

//ROO Billets
import ROOStaffList from './modules/ROO/Command.js';
import RRDList from './modules/ROO/RRD.js';
import RTCList from './modules/ROO/RTC.js';
import S5List from './modules/ROO/S5.js';

//Support Billets
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
    <div className='RegiContainer'>
      <div className='RegiTitle'>
        <h1> Regimental Command</h1>
      </div>
      <RCommandList listArray = {listArray}/>
    </div>
    <div className='17Container'>
      <div className='17Title'>
        <h1>First Battalion</h1>
      </div>
      <h2>1-7 Command Staff</h2>
      <Command1List listArray={listArray}/>
      <h2>Alpha Company 1-7</h2>
      <Alpha1List listArray={listArray}/>
      <h2>Bravo Company 1-7</h2>
      <Bravo1List listArray={listArray}/>
      <h2>Charlie Company 1-7</h2>
      <Charlie1List listArray={listArray}/>
    </div>
    <div className='27Container'>
      <div className='27Title'>
        <h1>Second Battalion</h1>
      </div>
      <h2>2-7 Command Staff</h2>
      <Command2List listArray={listArray}/>
      <h2>Alpha Company 2-7</h2>
      <Alpha2List listArray={listArray}/>
      <h2>Bravo Company 2-7</h2>
      <Bravo2List listArray={listArray}/>
      <h2>Charlie Company 2-7</h2>
      <Charlie2List listArray={listArray}/>
    </div>
    <div className='ACDContainer'>
      <div className='ACDTitle'>
        <h1>Auxillary Combat Division</h1>
      </div>
      <h2>ACD Command Staff</h2>
      <Command3List listArray={listArray}/>
      <h2>Alpha Division</h2>
      <Alpha3List listArray={listArray}/>
      <h2>Bravo Division</h2>
      <Bravo3List listArray={listArray}/>
      <h2>Charlie Division</h2>
      <Charlie3List listArray={listArray}/>
      <h2>Delta Division</h2>
      <Delta3List listArray={listArray}/>
      <h2>Echo Division</h2>
      <Echo3List listArray={listArray}/>
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
