/* TODO:

- Reorganize this terribleness into something more streamlined
- Wait for jarvis to update the API so that sort order is properly displayed
- Look into sorting by rank after sorting by billet (Subsorting? QuickSort maybe?)
- Styling
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
    <div className = "p-nav-primary">
      <div className = "p-nav-wrapper">
        <nav className = "p-nav">
          <div className = "p-nav-inner">
            <div className = "p-nav-scroller">
              <div className = "p-nav-logo">
                <a href="https://7cav.us">
                  <img className = "p-nav-png" src ={require("./style/themes/7cav/logo-m.png")} alt="ADR Logo" title="Return to the main website" width="" height=""/>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
    <div classname='ListContainer'>
      <div className='RegiContainer'>
        <div className='RegiTitle'>
          Regimental Command
        </div>
        <div className='RegiList'>
          <RCommandList listArray = {listArray}/>
        </div>
      </div>
      <div className='OneSevenContainer'>
        <div className='OneSevenTitle'>
          First Battalion
        </div>
        <div className='OneSevenCommand'>
          <div className='OneSevenCommandTitle'>
           1-7 Command
         </div>
         <div className='OneSevenCommandList'>
           <Command1List listArray={listArray}/>
         </div>
        </div>
        <div className='Alpha1'>
          <div className='Alpha1Title'>
           Alpha Company 1-7
         </div>
         <div className='Alpha1List'>
           <Alpha1List listArray={listArray}/>
         </div>
        </div>
        <div className='Bravo1'>
          <div className='Bravo1Title'>
           Bravo Company 1-7
         </div>
         <div className='Bravo1List'>
           <Bravo1List listArray={listArray}/>
         </div>
        </div>
        <div className='Charlie1'>
          <div className='Charlie1Title'>
           Charlie Company 1-7
         </div>
         <div className='Charlie1List'>
           <Charlie1List listArray={listArray}/>
         </div>
        </div>
      </div>
      <div className='TwoSevenContainer'>
        <div className='TwoSevenTitle'>
          Second Battalion
        </div>
        <div className='TwoSevenCommand'>
          <div className='TwoSevenCommandTitle'>
           2-7 Command
         </div>
         <div className='TwoSevenCommandList'>
           <Command2List listArray={listArray}/>
         </div>
        </div>
        <div className='Alpha2'>
          <div className='Alpha2Title'>
           Alpha Company 2-7
         </div>
         <div className='Alpha2List'>
           <Alpha2List listArray={listArray}/>
         </div>
        </div>
        <div className='Bravo2'>
          <div className='Bravo2Title'>
           Bravo Company 2-7
         </div>
         <div className='Bravo2List'>
           <Bravo2List listArray={listArray}/>
         </div>
        </div>
        <div className='Charlie2'>
          <div className='Charlie2Title'>
           Charlie Company 2-7
         </div>
         <div className='Charlie2List'>
           <Charlie2List listArray={listArray}/>
         </div>
        </div>
      </div>
      <div className='ACDContainer'>
        <div className='ACDTitle'>
          Auxillary Combat Division
        </div>
        <div className='ACDCommand'>
          <div className='ACDCommandTitle'>
           ACD Command
         </div>
         <div className='ACDCommandList'>
           <Command3List listArray={listArray}/>
         </div>
        </div>
        <div className='Alpha3'>
          <div className='Alpha3Title'>
           Alpha Division
         </div>
         <div className='Alpha3List'>
           <Alpha3List listArray={listArray}/>
         </div>
        </div>
        <div className='Bravo3'>
          <div className='Bravo3Title'>
           Bravo Division
         </div>
         <div className='Bravo3List'>
           <Bravo3List listArray={listArray}/>
         </div>
        </div>
        <div className='Charlie3'>
          <div className='Charlie3Title'>
           Charlie Division
         </div>
         <div className='Charlie3List'>
           <Charlie3List listArray={listArray}/>
         </div>
        </div>
        <div className='Delta3'>
          <div className='Delta3Title'>
           Delta Division
         </div>
         <div className='Delta3List'>
           <Delta3List listArray={listArray}/>
         </div>
        </div>
        <div className='Echo3'>
          <div className='Echo3Title'>
           Echo Division
         </div>
         <div className='Echo3List'>
           <Echo3List listArray={listArray}/>
         </div>
        </div>
      </div>
      <div className='IMOContainer'>
        <div className='IMOTitle'>
          Information Managment Office
        </div>
        <div className='IMOStaff'>
          <div className='IMOStaffTitle'>
           Information Management Office Command
          </div>
          <div className='IMOStaffList'>
            <IMOStaffList listArray = {listArray}/>
          </div>
        </div>
        <div className='S1'>
          <div className='S1Title'>
            S1 - Administration
          </div>
          <div className='S1List'>
            <S1List listArray = {listArray}/>
          </div>
        </div>
        <div className='S6'>
          <div className='S6Title'>
            S6 - Information Management
          </div>
          <div className='S6List'>
            <S6List listArray = {listArray}/>
          </div>
        </div>
        <div className='WAG'>
          <div className='WAGTitle'>
            Wiki Administration Group
          </div>
          <div className='WAGList'>
            <WAGList listArray = {listArray}/>
          </div>
        </div>
      </div>
      <div className='SecOpsContainer'>
        <div className='SecOpsTitle'>
          Security Operations Department
        </div>
        <div className='SecOpsStaff'>
          <div className='SecOpsStaffTitle'>
            Security Operations Command
          </div>
          <div className='SecOpsStaffList'>
            <SecOpsList listArray = {listArray}/>
          </div>
        </div>
        <div className='JAG'>
          <div className='JAGTitle'>
            Judge Advocate General Corps
          </div>
          <div className='JAGList'>
            <JAGList listArray = {listArray}/>
          </div>
        </div>
        <div className='MP'>
          <div className='MPTitle'>
            Military Police
          </div>
          <div className='MPList'>
            <MPList listArray = {listArray}/>
          </div>
        </div>
        <div className='S2'>
          <div className='S2Title'>
            S2 - Intelligence and Security
          </div>
          <div className='WAGList'>
            <S2List listArray = {listArray}/>
          </div>
        </div>
      </div>
      <div className='ROOContainer'>
      <div className='ROOTitle'>
          Recruitment Oversight Office
        </div>
        <div className='ROOStaff'>
          <div className='ROOStaffTitle'>
            Recruitment Oversight Command
          </div>
          <div className='ROOStaffList'>
            <ROOStaffList listArray = {listArray}/>
          </div>
        </div>
        <div className='RRD'>
          <div className='RRDTitle'>
            Regimental Recruiting Department
          </div>
          <div className='RRDList'>
            <RRDList listArray = {listArray}/>
          </div>
        </div>
        <div className='RTC'>
          <div className='RTCTitle'>
            Recruit Training Command
          </div>
          <div className='RTCList'>
            <RTCList listArray = {listArray}/>
          </div>
        </div>
        <div className='S5'>
          <div className='S5Title'>
            S5 - Public Relations
          </div>
          <div className='S5List'>
            <S5List listArray = {listArray}/>
          </div>
        </div>
      </div>
      <div className='SupportContainer'>
       <div className='SupportTitle'>
          Support Departments
        </div>
        <div className='SPD'>
          <div className='SPDTitle'>
            Special Projects Division
          </div>
          <div className='SPDList'>
            <SPDList listArray = {listArray}/>
          </div>
        </div>
        <div className='S3'>
          <div className='S3Title'>
            S3 - Operations
          </div>
          <div className='S3List'>
            <S3List listArray = {listArray}/>
          </div>
        </div>
        <div className='S7'>
          <div className='S7Title'>
            S7 - Training
          </div>
          <div className='S7List'>
            <S7List listArray = {listArray}/>
          </div>
        </div>
      </div>
    </div>
  </div> 
  )
}
export default MilpacRequest; 
