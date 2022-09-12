import React, {useEffect, useState} from 'react';
import './App.css';
import Collapsible from 'react-collapsible';
import * as lists from './modules/Generic/BilletBank';
import MilpacParse from './modules/Generic/MilpacParse';

function MilpacRequest () {

  const [milpacList, setMilpacList] = useState ([]);
  const [reserveList, setReserveList] = useState ([]);
  
  useEffect(() => {
      async function fetchMilpacList() {
          try {
              const requestUrl = 'https://bff.adr.7cav.us/roster/combat'
              //const requestUrl = 'http://localhost:4000/roster/combat'    //Use this for local hosting
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
            //const requestUrl = 'http://localhost:4000/roster/reserves'    //Use this for local hosting
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
      <div className='DepartmentContainer'>
        <Collapsible trigger="Regimental Command" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.regiCommand} subtitle = {'Command Staff'}/>
        </Collapsible>
      </div>
      <div className='DepartmentContainer'>
        <Collapsible trigger="First Battalion" triggerClassName="Title" triggerOpenedClassName="Title" open={true}> 
          <div className='OneSevenCommand'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.oneSevenCommand} subtitle = {'1-7 Command'}/>
          </div>
          <div className='Alpha1'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.alpha1} subtitle = {'Alpha Company 1-7'}/>
          </div>
          <div className='Bravo1'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.bravo1} subtitle = {'Bravo Company 1-7'}/>
          </div>
          <div className='Charlie1'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.charlie1} subtitle = {'Charlie Company 1-7'}/>
          </div>
        </Collapsible>
      </div>
      <div className='DepartmentContainer'>
        <Collapsible trigger="Second Battalion" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='TwoSevenCommand'>
           <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.twoSevenCommand} subtitle = {'2-7 Command'}/>
          </div>
          <div className='Alpha2'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.alpha2} subtitle = {'Alpha Company 2-7'}/>
          </div>
          <div className='Bravo2'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.bravo2} subtitle = {'Bravo Company 2-7'}/>
          </div>
          <div className='Charlie2'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.charlie2} subtitle = {'Charlie Company 2-7'}/>
          </div>
        </Collapsible>
      </div>
      <div className='DepartmentContainer'>
        <Collapsible trigger="Auxillary Combat Division" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='ACDCommand'>
           <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.acdCommand} subtitle = {'ACD Command'}/>
          </div>
          <div className='Alpha3'>
           <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.alpha3} subtitle = {'Alpha Division'}/>
          </div>
          <div className='Bravo3'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.bravo3} subtitle = {'Bravo Division'}/>
          </div>
          <div className='Charlie3'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.charlie3} subtitle = {'Charlie Division'}/>
          </div>
          <div className='Delta3'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.delta3} subtitle = {'Delta Division'}/>
          </div>
          <div className='Echo3'>
            <MilpacParse usePrimaryOnly = {true} milpacArray = {milpacArray} billetIDs = {lists.default.echo3} subtitle = {'Echo Division'}/>
          </div>
        </Collapsible>
      </div>
      <div className='DepartmentContainer'>
        <Collapsible trigger="Information Management Office" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='IMOStaff'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.imoCommand} subtitle = {'Information Management Office Command'}/>
          </div>
          <div className='S1'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s1} subtitle = {'S1 - Administration'}/>
          </div>
          <div className='S6'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s6} subtitle = {'S6 - Information Management'}/>
          </div>
          <div className='WAG'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.wag} subtitle = {'Wiki Administration Group'}/>
          </div>
        </Collapsible>
      </div>
      <div className='DepartmentContainer'>
        <Collapsible trigger="Security Operations Department" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='SecOpsStaff'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.secOpsCommand} subtitle = {'Security Operations Command'}/>
          </div>
          <div className='JAG'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.jag} subtitle = {'Judge Advocate General Corps'}/>
          </div>
          <div className='MP'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.mp} subtitle = {'Military Police'}/>
          </div>
          <div className='S2'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s2} subtitle = {'S2 - Intelligence and Security'}/>
          </div>
        </Collapsible>
      </div>
      <div className='DepartmentContainer'>
        <Collapsible trigger="Recruitment Oversight Office" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='ROOStaff'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.rooCommand} subtitle = {'Recruitment Oversight Command'}/>
          </div>
          <div className='RRD'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.rrd} subtitle = {'Regimental Recruiting Department'}/>
          </div>
          <div className='RTC'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.rtc} subtitle = {'Recruit Training Command'}/>
          </div>
          <div className='S5'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s5} subtitle = {'S5 - Public Relations'}/>
          </div>
        </Collapsible>
      </div>
      <div className='DepartmentContainer'>
        <Collapsible trigger="Support Departments" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
          <div className='SPD'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.spd} subtitle = {'Special Projects Division'}/>
          </div>
          <div className='S3'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s3} subtitle = {'S3 - Operations'}/>
          </div>
          <div className='S7'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.s7} subtitle = {'S7 - Training'}/>
          </div>
          <div className='LD'>
            <MilpacParse milpacArray = {milpacArray} billetIDs = {lists.default.ld} subtitle = {'Leadership Development'}/>
          </div>
        </Collapsible>
      </div>
    </div>
  </div> 
  )
} 
export default MilpacRequest