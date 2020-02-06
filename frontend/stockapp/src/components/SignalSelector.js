import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
`;

const Title = styled.h3`
  color: #054264
`

const InlineDiv = styled.div`
  display: inline
`

const SearchBtn = styled.button`
  background: #2081BA;
  color: #fff;
  border: 0;
  margin-left: 5px;
`

const Description = styled.span`
  font-size: 10px;
  color: #666;
  margin-left: 10px;
`

class SignalSelector extends React.Component {
  constructor() {
    super();
    this.state = {
      signal_chosen: '',
      signal_chosen_name: '',
      signal_lv_max: 10000,
      signal_lv_min: 0,
    };
  }

  render() {
    return (
        <Wrapper>
            <form onSubmit={e => { e.preventDefault(); }}>
                <Title>Search the signal:</Title>
                <select id="" onChange={this.changeDropdownSignal.bind(this)} value={this.state.signal_chosen}>
                    { this.populateOptions( this.props.signalList, "--- Choose the signal ---" ) }
                </select>
                { this.generateSignalInputs() }
            </form>
        </Wrapper>
    );
  }

  generateSignalInputs() {
    // No input required if no signal is selected
    if(this.state.signal_chosen_name !== '' && this.state.signal_chosen_name !== 'no change') {
      return (
        <InlineDiv>
          &nbsp;from&nbsp;
          <input min="0" max="1000000000" type="number" value={this.state.signal_lv_min} onChange={e => this.setState({ signal_lv_min: e.target.value })} />
          %&nbsp;to&nbsp;
          <input min="0" max="1000000000" type="number" value={this.state.signal_lv_max} onChange={e => this.setState({ signal_lv_max: e.target.value })} />
          %
          <SearchBtn onClick={() => this.props.chooseSignal( this.state.signal_chosen, this.state.signal_lv_min, this.state.signal_lv_max ) }>Search</SearchBtn>
          <Description>New search will clear the current chart data</Description>
        </InlineDiv>
      )
    }
    // If any signal is selected (for 'no change' signal)
    if(this.state.signal_chosen_name !== '') {
      return (
        <InlineDiv>
          <SearchBtn onClick={() => this.props.chooseSignal( this.state.signal_chosen, this.state.signal_lv_min, this.state.signal_lv_max ) }>Search</SearchBtn>
          <Description>New search will clear the current chart data</Description>
        </InlineDiv>
      )
    }
  }

  changeDropdownSignal(e) {
    let index = e.target.selectedIndex;
    let el = e.target.childNodes[index]
    let signal_name =  el.getAttribute('keyname');  
    this.props.updateSignalName( signal_name )
    this.setState({
        signal_chosen: e.target.value,
        signal_chosen_name: signal_name
    });
  }

  // Poppulate signals list
  // Input Example: [{signal_id: 1, signal_name: 'Apple'}, {signal_id: 2, signal_name: 'Orange'}]
  populateOptions(data=[], default_option="--- Choose ---") {
    let new_data = data.slice()
    // Add default option
    new_data.unshift({ signal_id: '', signal_name: default_option })
    // Generate JSX and return
    return new_data.map(ele => <option key={ele.signal_id} keyname={ele.signal_name} value={ele.signal_id}>{this.capitalize(ele.signal_name)}</option>)
  }
  
  // Capitalize String
  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export default SignalSelector;
