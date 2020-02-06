import React, { Component } from 'react';
import './App.css';
import NotificationSystem from 'react-notification-system'

import StockChart from './components/StockChart'
import SignalSelector from './components/SignalSelector'
import CompanySelector from './components/CompanySelector'

import styled from 'styled-components'

// Styled Components
const api_url = 'http://188.166.239.133'

const CompanyCountText = styled.div`
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  color: #1E80B8;
  padding: 10px;
  border: 1px solid #1E80B8;
  border-radius: 5px;
  background: #d7e1e6;
`

const Wrapper = styled.div`
  width: 95%;
  max-width: 1000px;
  margin: auto;
`

const Header = styled.div`
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  padding: 15px 20px;
  margin-top: 20px;
  border-radius: 5px;

  background: #054264; /* Old browsers */
  background: -moz-linear-gradient(left, #054264 0%, #207cca 33%, #2989d8 50%, #127eb8 100%); /* FF3.6-15 */
  background: -webkit-linear-gradient(left, #054264 0%,#207cca 33%,#2989d8 50%,#127eb8 100%); /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to right, #054264 0%,#207cca 33%,#2989d8 50%,#127eb8 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#054264', endColorstr='#127eb8',GradientType=1 ); /* IE6-9 */
`

const Footer = styled.div`
border-top: 1px solid #ccc;
margin-top: 30px;
padding-top: 10px;
color: #666;
font-size: 10px;
`

const Description = styled.div`
  padding: 10px 0;
`

const Title = styled.h3`
  color: ${props => props.fall ? '#640505' : '#054264'}
  margin-bottom: 0;
`

const CompList = styled.ol`
  li {
    margin: 5px 0;
    color: ${props => props.fall ? '#640505' : '#054264'}
  }

  li:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

const OneTwoColumn = styled.div`
  width: 50%;
  float: left;
`

// React Components
class App extends Component {
  constructor() {
    super();

    this.notify = null

    // Set State for Input
    this.state = {
      signal_list: [],
      company_list: [],
      company_selected: [],
      company_count: -1,
      signal_name: '',
      current_signal_name: '',
      signal_value: 0,
      current_signal_value: []
    };
  }
  
  render() {
    return (
      <Wrapper>
        <NotificationSystem ref="notificationSystem" />

        <Header>Stock Analyser</Header>
        <Description>This tool is created to help bankers and traders finding the right companies with an interesting signal.</Description>
        
        <OneTwoColumn>
          <Title>Top 5 Rising Companies in 2017</Title>
          <Description>Click on the company name to see the performance</Description>
          { this.generateTop5List() }
        </OneTwoColumn>

        <OneTwoColumn>
          <Title fall>Top 5 Falling Companies in 2017</Title>
          <Description>Click on the company name to see the performance</Description>
          { this.generateTop5FallList() }
        </OneTwoColumn>

        <hr />

        <Description>or search the companies:</Description>
        <SignalSelector
          signalList={this.state.signal_list}
          chooseSignal={this.updateSignal.bind(this)}
          updateSignalName={this.updateSignalName.bind(this)} />
        { this.generateCompanyCount() }
        <CompanySelector
          companyList={this.state.company_list}
          chooseCompany={this.updateCompany.bind(this)}
          updateSignalValue={this.updateSignalValue.bind(this)}
          resetCompany={this.resetCompany.bind(this)} />
        <StockChart
          selectedCompany={this.state.company_selected}
          signalName={this.state.current_signal_name}
          signalValue={this.state.current_signal_value}
          removeCompany={this.removeCompany.bind(this)}
          apiURL={api_url}
          />

        <Footer>The data in Stock Analyzer is from 01/01/2017 to 31/12/2017.</Footer>
      </Wrapper>
    );
  }

  generateCompanyCount() {
    if(this.state.company_count >= 0) {
      return (<CompanyCountText>
        We found { this.state.company_count } companies with the selected criteria.
      </CompanyCountText>)
    } else {
      return ''
    }
  }

  generateTop5List() {
    return (
      <CompList>
        <li onClick={ () => this.queryStock('rise', 'MYQ', 2912.5) }>MYQ (2912.5% in 2017)</li>
        <li onClick={ () => this.queryStock('rise', 'FEI', 1900) }>FEI (1900% in 2017)</li>
        <li onClick={ () => this.queryStock('rise', 'AVZ', 1542.86) }>AVZ (1542.86% in 2017)</li>
        <li onClick={ () => this.queryStock('rise', 'AUZ', 1400) }>AUZ (1400% in 2017)</li>
        <li onClick={ () => this.queryStock('rise', 'BIG', 1352) }>BUG (1352% in 2017)</li>
      </CompList> 
    )
  }

  generateTop5FallList() {
    return (
      <CompList fall>
        <li onClick={ () => this.queryStock('fall', 'LFC', 98.8) }>LFC (98.8% in 2017)</li>
        <li onClick={ () => this.queryStock('fall', 'IIL', 96.97) }>IIL 96.97% in 2017)</li>
        <li onClick={ () => this.queryStock('fall', 'AVW', 96.82) }>AVW (96.82% in 2017)</li>
        <li onClick={ () => this.queryStock('fall', 'LTN', 96.36) }>LTN (96.36% in 2017)</li>
        <li onClick={ () => this.queryStock('fall', 'RAN', 95.1) }>RAN (95.1% in 2017)</li>
      </CompList> 
    )
  }

  queryStock(signal, stock_name, stock_value) {
    this.setState({
      signal_name: signal,
      current_signal_name: signal,
      company_selected: [ stock_name ],
      signal_value: stock_value,
      current_signal_value: [ stock_value ]
    })
  }

  updateSignalName(signal_name) {
    this.setState({ signal_name })
  }

  updateSignalValue(signal_value) {
    this.setState({ signal_value })
  }

  // Fetch all the signals when mounted
  componentDidMount() {
    // Install Notification System
    this.notify = this.refs.notificationSystem;
    // Example Notification
      // this.notify.addNotification({
      //   message: 'Notification message',
      //   level: 'success'
      // });
    fetch(api_url + '/signals').then(results => {
      return results.json()
    }).catch(error => {
      this.notify.addNotification({
        message: 'The API server seems to be down. Please refresh the page or contact Perth at woratana.n@gmail.com.',
        level: 'error'
      });
    }).then(data => {
      // Send the signal list to dropdown
      this.setState({ signal_list: data })
    })
  }

  // Update company list based on the signal_ID
  updateSignal(signal_id, signal_lv_min, signal_lv_max) {
    // Set the current signal name
    this.setState({
      current_signal_name: this.state.signal_name
    })

    // For no change, set the min/max lv to 0
    if(this.state.signal_name === 'no change') {
      signal_lv_min = 0
      signal_lv_max = 0
    }

    if(signal_id === '') {
      // Send notification
      this.notify.addNotification({
        message: 'Please select the signal from dropdown list.',
        level: 'info'
      });
      return
    }

    // If the first number is more than the second number, swap them
    if(parseInt(signal_lv_min, 10) > parseInt(signal_lv_max, 10)) {
      [signal_lv_min, signal_lv_max] = [signal_lv_max, signal_lv_min]
    }

    // Reset the chart
    this.setState({
      company_list: [],
      company_selected: [],
      company_count: -1,
      signal_value: 0,
      current_signal_value: []
    })
    
    // Fetch the list of company based on the signal criteria
    fetch(api_url + '/get_stock_signal/' + signal_id + '/' + signal_lv_min + '/' + signal_lv_max).then(results => {
      return results.json()
    }).then(data => {
      // Send the signal list to dropdown
      this.setState({
        company_list: data,
        company_count: data.length
      })
    })
  }

  // Add the chosen company to the stock chart
  updateCompany(chosen_company) {
    // Don't allow adding more than 5 companies
    if(this.state.company_selected.length >= 5) {
      this.notify.addNotification({
        message: 'The limit of companies to compare is 5. Please remove some companies before adding the new company.',
        level: 'info'
      });
    } else {
      // Check if company already exist (prevent adding the same company twice)
      if(this.state.company_selected.indexOf(chosen_company) === -1) {
        let company_selected = this.state.company_selected.slice()
        company_selected.push(chosen_company)

        let current_signal_value = this.state.current_signal_value.slice()
        current_signal_value.push(this.state.signal_value)

        this.setState({ company_selected, current_signal_value })
      }
    }
  }

  // Remove the company from the stock chart
  removeCompany(company_name) {
    let cIndex = this.state.company_selected.indexOf(company_name)
    if(cIndex !== -1) {
      let company_selected = this.state.company_selected.slice()
      let current_signal_value = this.state.current_signal_value.slice()
      company_selected.splice(cIndex, 1)
      current_signal_value.splice(cIndex, 1)
      this.setState({ company_selected, current_signal_value })
    }
  }

  // Clear all companies
  resetCompany() {
    this.setState({
      company_selected: [],
      current_signal_value: []
    })
  }
}

export default App;
