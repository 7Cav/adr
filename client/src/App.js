import React, {useEffect, useState} from 'react';
import './App.css';
import Collapsible from 'react-collapsible';
import * as lists from './modules/Generic/BilletBank';
import MilpacParse from './modules/Generic/MilpacParse';
import ReactDOM from 'react-dom'

function MilpacRequest () {

  const [milpacList, setMilpacList] = useState ([]);
  const [reserveList, setReserveList] = useState ([]);
  
  useEffect(() => {
      async function fetchMilpacList() {
          try {
              const requestUrl = 'https://bff.adr.7cav.us/roster/combat'
              //const requestUrl = 'http://localhost:4000/roster/combat'
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
            const requestUrl = 'https://bff.adr.7cav.us/roster/reserves'
            //const requestUrl = 'http://localhost:4000/roster/reserves'
            const response = await fetch (requestUrl);
            const responseJSON = await response.json();
            setReserveList(responseJSON);
        } catch {

        }
    } 
    fetchReserveList();
  },[]);

  var milpacArray = []
  milpacArray.push({
    "combat": milpacList,
    "reserve": reserveList,
  })

 /*(return(
   <h1><MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s1}/></h1>
 )*/

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
        <Collapsible trigger="Regimental Command" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
        <div className='RegiList'>
          <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.regiCommand}/>
        </div>
        </Collapsible>
      </div>
      <div className='OneSevenContainer'>
        <Collapsible trigger="First Battalion" triggerClassName="Title" triggerOpenedClassName="Title" open={true}> 
          <div className='OneSevenCommand'>
            <div className='OneSevenCommandTitle'>
            1-7 Command
          </div>
          <div className='OneSevenCommandList'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.oneSevenCommand}/>
          </div>
          </div>
          <div className='Alpha1'>
            <div className='Alpha1Title'>
            Alpha Company 1-7
          </div>
          <div className='Alpha1List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.alpha1}/>
          </div>
          </div>
          <div className='Bravo1'>
            <div className='Bravo1Title'>
            Bravo Company 1-7
          </div>
          <div className='Bravo1List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.bravo1}/>
          </div>
          </div>
          <div className='Charlie1'>
            <div className='Charlie1Title'>
            Charlie Company 1-7
          </div>
          <div className='Charlie1List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.charlie1}/>
          </div>
          </div>
        </Collapsible>
      </div>
      <div className='TwoSevenContainer'>
        <Collapsible trigger="Second Battalion" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='TwoSevenCommand'>
            <div className='TwoSevenCommandTitle'>
            2-7 Command
          </div>
          <div className='TwoSevenCommandList'>
           <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.twoSevenCommand}/>
          </div>
          </div>
          <div className='Alpha2'>
            <div className='Alpha2Title'>
            Alpha Company 2-7
          </div>
          <div className='Alpha2List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.alpha2}/>
          </div>
          </div>
          <div className='Bravo2'>
            <div className='Bravo2Title'>
            Bravo Company 2-7
          </div>
          <div className='Bravo2List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.bravo2}/>
          </div>
          </div>
          <div className='Charlie2'>
            <div className='Charlie2Title'>
            Charlie Company 2-7
          </div>
          <div className='Charlie2List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.charlie2}/>
          </div>
          </div>
        </Collapsible>
      </div>
      <div className='ACDContainer'>
        <Collapsible trigger="Auxillary Combat Division" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='ACDCommand'>
            <div className='ACDCommandTitle'>
            ACD Command
          </div>
          <div className='ACDCommandList'>
           <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.acdCommand}/>
          </div>
          </div>
          <div className='Alpha3'>
            <div className='Alpha3Title'>
            Alpha Division
          </div>
          <div className='Alpha3List'>
           <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.alpha3}/>
          </div>
          </div>
          <div className='Bravo3'>
            <div className='Bravo3Title'>
            Bravo Division
          </div>
          <div className='Bravo3List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.bravo3}/>
          </div>
          </div>
          <div className='Charlie3'>
            <div className='Charlie3Title'>
            Charlie Division
          </div>
          <div className='Charlie3List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.charlie3}/>
          </div>
          </div>
          <div className='Delta3'>
            <div className='Delta3Title'>
            Delta Division
          </div>
          <div className='Delta3List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.delta3}/>
          </div>
          </div>
          <div className='Echo3'>
            <div className='Echo3Title'>
            Echo Division
          </div>
          <div className='Echo3List'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.echo3}/>
          </div>
          </div>
        </Collapsible>
      </div>
      <div className='IMOContainer'>
        <Collapsible trigger="Information Management Office" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='IMOStaff'>
            <div className='IMOStaffTitle'>
            Information Management Office Command
            </div>
            <div className='IMOStaffList'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.imoCommand}/>
            </div>
          </div>
          <div className='S1'>
            <div className='S1Title'>
              S1 - Administration
            </div>
            <div className='S1List'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s1}/>
            </div>
          </div>
          <div className='S6'>
            <div className='S6Title'>
              S6 - Information Management
            </div>
            <div className='S6List'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s6}/>
            </div>
          </div>
          <div className='WAG'>
            <div className='WAGTitle'>
              Wiki Administration Group
            </div>
            <div className='WAGList'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.wag}/>
            </div>
          </div>
        </Collapsible>
      </div>
      <div className='SecOpsContainer'>
        <Collapsible trigger="Security Operations Department" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='SecOpsStaff'>
            <div className='SecOpsStaffTitle'>
              Security Operations Command
            </div>
            <div className='SecOpsStaffList'>
             <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.secOpsCommand}/>
            </div>
          </div>
          <div className='JAG'>
            <div className='JAGTitle'>
              Judge Advocate General Corps
            </div>
            <div className='JAGList'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.jag}/>
            </div>
          </div>
          <div className='MP'>
            <div className='MPTitle'>
              Military Police
            </div>
            <div className='MPList'>
             <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.mp}/>
            </div>
          </div>
          <div className='S2'>
            <div className='S2Title'>
              S2 - Intelligence and Security
            </div>
            <div className='S2List'>
             <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s2}/>
            </div>
          </div>
        </Collapsible>
      </div>
      <div className='ROOContainer'>
        <Collapsible trigger="Recruitment Oversight Office" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='ROOStaff'>
            <div className='ROOStaffTitle'>
              Recruitment Oversight Command
            </div>
            <div className='ROOStaffList'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.rooCommand}/>
            </div>
          </div>
          <div className='RRD'>
            <div className='RRDTitle'>
              Regimental Recruiting Department
            </div>
            <div className='RRDList'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.rrd}/>
            </div>
          </div>
          <div className='RTC'>
            <div className='RTCTitle'>
              Recruit Training Command
            </div>
            <div className='RTCList'>
             <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.rtc}/>
            </div>
          </div>
          <div className='S5'>
            <div className='S5Title'>
              S5 - Public Relations
            </div>
            <div className='S5List'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s5}/>
            </div>
          </div>
        </Collapsible>
      </div>
      <div className='SupportContainer'>
        <Collapsible trigger="Support Departments" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='SPD'>
            <div className='SPDTitle'>
              Special Projects Division
            </div>
            <div className='SPDList'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.spd}/>
            </div>
          </div>
          <div className='S3'>
            <div className='S3Title'>
              S3 - Operations
            </div>
            <div className='S3List'>
             <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s3}/>
            </div>
          </div>
          <div className='S7'>
            <div className='S7Title'>
              S7 - Training
            </div>
            <div className='S7List'>
              <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s7}/>
            </div>
          </div>
        </Collapsible>
      </div>
    </div>
  </div> 
  )
} 
export default MilpacRequest