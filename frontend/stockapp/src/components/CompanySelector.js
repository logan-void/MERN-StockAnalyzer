import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
`;

const Title = styled.h3`
  color: #054264
`

const Description = styled.span`
  font-size: 10px;
  color: #666;
  margin-left: 10px;
`

const AddChartBtn = styled.button`
  background: #2081BA;
  color: #fff;
  border: 0;
  margin-left: 5px;
  margin-right: 10px;
`

class CompanySelector extends React.Component {
  constructor() {
    super();
    this.state = {
        chosen_company: '',
    };
  }

  render() {
    if(this.props.companyList.length > 0) {
      return (
        <Wrapper>
          <Title>Select the company to visualize</Title>
          <select onChange={this.changeDropdownSignal.bind(this)} value={this.state.chosen_company}>
              { this.populateOptions( this.props.companyList, "--- Choose the company ---" ) }
          </select>
          <AddChartBtn onClick={ this.addCompany.bind(this) }>+ Add to chart</AddChartBtn>
          <button onClick={ this.props.resetCompany }>Clear stock chart</button>
          <Description>You can compare up to 5 charts at the same time</Description>
        </Wrapper>
      );
    } else {
      return <div></div>
    }
  }

  addCompany() {
    this.setState({ chosen_company: this.state.chosen_company })
    this.props.chooseCompany( this.state.chosen_company )
  }

  // Change dropdown
  changeDropdownSignal(e) {
    let index = e.target.selectedIndex;
    let el = e.target.childNodes[index]
    let signal_value =  el.getAttribute('keylv');  
    this.props.updateSignalValue( signal_value )
    this.setState({chosen_company: e.target.value});
  }

  // Popuplate company list
  // Input Example: [{signal_id: 1, asx_stockname: 'APP', signal_level: 3.5}, { ... }]
  populateOptions(data=[], default_option="--- Choose ---") {
    let new_data = data.slice()
    // Sort data by signal_level
    new_data.sort((a,b) => b.signal_level - a.signal_level)
    // Generate JSX
    let new_data_jsx = new_data.map(ele => <option key={ele.asx_stockname} value={ele.asx_stockname} keylv={ele.signal_level}>({ele.signal_level}%) {ele.asx_stockname}</option>)
    // Add default option
    new_data_jsx.unshift( <option key="Choose" value="">{default_option}</option> )
    return new_data_jsx
  }
}

export default CompanySelector;
