import React, { useEffect, useState } from 'react';
import './App.css';
import Collapsible from 'react-collapsible';
import lists from './modules/Generic/BilletBank';
import MilpacParse from './modules/Generic/MilpacParse';
// import {Helmet} from 'react-helmet';

function MilpacRequest() {

  const [milpacList, setMilpacList] = useState([]);
  const [reserveList, setReserveList] = useState([]);
  const clscript = `<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "dig85agbqz");
</script>`

  useEffect(() => {
    async function fetchMilpacList() {
      try {
        const requestUrl = 'https://bff.adr.7cav.us/roster/combat'
        //const requestUrl = 'http://localhost:4000/roster/combat'    //Use this for local hosting
        const response = await fetch(requestUrl);
        const responseJSON = await response.json();
        setMilpacList(responseJSON);
      } catch {

      }
    }
    fetchMilpacList();
  }, []);

  useEffect(() => {
    async function fetchReserveList() {
      try {
        const requestUrl = 'https://bff.adr.7cav.us/roster/reserves'
        //const requestUrl = 'http://localhost:4000/roster/reserves'    //Use this for local hosting
        const response = await fetch(requestUrl);
        const responseJSON = await response.json();
        setReserveList(responseJSON);
      } catch {

      }
    }
    fetchReserveList();
  }, []);

  var milpacArray = []
  milpacArray.push({
    "combat": milpacList,
    "reserve": reserveList,
  })

  return (
    <div className='MasterContainer'>
      <div
        dangerouslySetInnerHTML={{ __html: clscript }}
      />
      <div className="p-nav-primary">
        <div className="p-nav-wrapper">
          <nav className="p-nav">
            <div className="p-nav-inner">
              <div className="p-nav-scroller">
                <div className="p-nav-logo">
                  <a href="https://7cav.us">
                    <img className="p-nav-png" src={require("./style/themes/7cav/logo-m.png")} alt="ADR Logo" title="Return to the main website" width="" height="" />
                  </a>
                </div>
                {/* Data Age Warning */}
                <div className="p-nav-info">
                  <p>Data may be up to 1 hour old</p>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
      <div className='ListContainer'>
        <div className='DepartmentContainer'>
          <Collapsible trigger="Regimental Command" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.regiCommand} subtitle={'Command Staff'} />
          </Collapsible>
        </div>
        <div className='DepartmentContainer'>
          <Collapsible trigger="First Battalion" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <div className='OneSevenCommand'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.oneSevenCommand} subtitle={'1-7 Command'} />
            </div>
            <div className='Alpha1'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.alpha1} subtitle={'Alpha Company 1-7'} />
            </div>
            <div className='Bravo1'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.bravo1} subtitle={'Bravo Company 1-7'} />
            </div>
            <div className='Charlie1'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.charlie1} subtitle={'Charlie Company 1-7'} />
            </div>
          </Collapsible>
        </div>
        <div className='DepartmentContainer'>
          <Collapsible trigger="Second Battalion" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <div className='TwoSevenCommand'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.twoSevenCommand} subtitle={'2-7 Command'} />
            </div>
            <div className='Alpha2'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.alpha2} subtitle={'Alpha Company 2-7'} />
            </div>
            <div className='Bravo2'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.bravo2} subtitle={'Bravo Company 2-7'} />
            </div>
            <div className='Charlie2'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.charlie2} subtitle={'Charlie Company 2-7'} />
            </div>
          </Collapsible>
        </div>
        <div className='DepartmentContainer'>
          <Collapsible trigger="Auxillary Combat Division" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <div className='ACDCommand'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.acdCommand} subtitle={'ACD Command'} />
            </div>
            <div className='Alpha3'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.alpha3} subtitle={'Alpha Company'} />
            </div>
            <div className='Bravo3'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.bravo3} subtitle={'Bravo Company'} />
            </div>
            <div className='Charlie3'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.charlie3} subtitle={'Charlie Company'} />
            </div>
            <div className='Delta3'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.delta3} subtitle={'Delta Company'} />
            </div>
            <div className='Echo3'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.echo3} subtitle={'Echo Company'} />
            </div>
            <div className='starterPlatoon'>
              <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.starterPlatoon} subtitle={'Starter Platoon'} />
            </div>
            <div className='futureC'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.futureC} subtitle={'Futures and Concepts Center'} />
            </div>
          </Collapsible>
        </div>
        <div className='DepartmentContainer'>
          <Collapsible trigger="Information Management Office" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <div className='IMOStaff'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.imoCommand} subtitle={'Information Management Office Command'} />
            </div>
            <div className='S1'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.s1} subtitle={'S1 - Administration'} />
            </div>
            <div className='S6'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.s6} subtitle={'S6 - Information Management'} />
            </div>
            <div className='WAG'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.wag} subtitle={'Wiki Administration Group'} />
            </div>
          </Collapsible>
        </div>
        <div className='DepartmentContainer'>
          <Collapsible trigger="Security Operations Department" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <div className='SecOpsStaff'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.secOpsCommand} subtitle={'Security Operations Command'} />
            </div>
            <div className='JAG'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.jag} subtitle={'Judge Advocate General Corps'} />
            </div>
            <div className='MP'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.mp} subtitle={'Military Police'} />
            </div>
            <div className='S2'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.s2} subtitle={'S2 - Intelligence and Security'} />
            </div>
          </Collapsible>
        </div>
        <div className='DepartmentContainer'>
          <Collapsible trigger="Recruitment Oversight Office" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <div className='ROOStaff'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.rooCommand} subtitle={'Recruitment Oversight Command'} />
            </div>
            <div className='RRD'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.rrd} subtitle={'Regimental Recruiting Department'} />
            </div>
            <div className='RTC'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.rtc} subtitle={'Recruit Training Command'} />
            </div>
            <div className='S5'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.s5} subtitle={'S5 - Public Relations'} />
            </div>
          </Collapsible>
        </div>
        <div className='DepartmentContainer'>
          <Collapsible trigger="Support Departments" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
            <div className='SPD'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.spd} subtitle={'Special Projects Division'} />
            </div>
            <div className='S3'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.s3} subtitle={'S3 - Operations'} />
            </div>
            <div className='S7'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.s7} subtitle={'S7 - Training'} />
            </div>
            <div className='LD'>
              <MilpacParse milpacArray={milpacArray} billetIDs={lists.ld} subtitle={'Leadership Development'} />
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
export default MilpacRequest
