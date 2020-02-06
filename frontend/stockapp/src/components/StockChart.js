import React, { Component } from 'react';

import styled from 'styled-components';
import moment from 'moment';
import { Label, Legend, AreaChart, Area, linearGradient, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ChartWrapper = styled.div`
`

const BlankChart = styled.div`
  height: 200px;
  text-align: center;
  line-height: 200px;
  color: #ccc;
`

const ChartTitle = styled.h2`
  font-size: 2em;
  margin-bottom: 0;
  margin-top: 5px;

  span {
    color: #2081BA;
  }
`;

const TitleWrapper = styled.div`
  margin-top: 20px;
`

const TooltipTime = styled.div`
  color: #2081BA;
`;

const TooltipPrice = styled.div`
  color: black;
`;

class StockChart extends Component {
  constructor() {
    super();
    
    this.state = {
      plot_data_unformatted: []
    }

    this.sample_data = [
      { MMJ: 15.5, time: 1503611308914 },
      { MMJ: 20.10, time: 1503613184594 },
      { MMJ: 12.001, time: 1503616882654 },
      { MMJ: 15, time: 1503616962277 },
      { MMJ: 14, time: 1503617297689 },
    ]

    this.chart_palette = [
      { stroke_color: '#8884d8', gradient_name: 'colorPurple' },
      { stroke_color: '#82ca9d', gradient_name: 'colorGreen' },
      { stroke_color: '#ffc658', gradient_name: 'colorOrange' },
      { stroke_color: '#83a6ed', gradient_name: 'colorBlue' },
      { stroke_color: '#d0ed57', gradient_name: 'colorLightGreen' },
    ]
  }

  render() {
    return (
      <ChartWrapper>
      { this.getChart() }
      </ChartWrapper>
    )
  }

  getChart() {
    if(this.props.selectedCompany.length > 0) {
      return (
        <div>
          <TitleWrapper>{ this.getChartTitle() }</TitleWrapper>
          <ResponsiveContainer width = '100%' height = {500} >
            <AreaChart
                data={ this.convertedPlotData() }
                // data={this.sample_data}
                margin={{ top: 5, right: 0, left: 15, bottom: 15 }}
              >
              <defs>
                <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#83a6ed" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#83a6ed" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLightGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d0ed57" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#d0ed57" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey = 'time'
                // domain = {['auto', 'auto']}
                domain = {[1483228800000, 1514678400000]}
                name = 'Time'
                tickFormatter = {(unixTime) => {
                  let time = moment(unixTime).format('DD-MM-YYYY')
                  return time
                }}
                type = 'number' // Important for time series
              >
                <Label value="Time" offset={-10} position="insideBottom" />
              </XAxis>
              <YAxis name = 'Value' label={{ value: 'Stock Closing Price (A$)', angle: -90, position: 'insideLeft', offset: -2 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <CartesianGrid stroke="#f5f5f5" />
              { this.generateAreaElements() }
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )
    } else if(this.props.signalName !== '') {
      return <BlankChart>Add company to see the stock performance</BlankChart>
    }
  }

  generateAreaElements() {
    let areaEles = []
    this.props.selectedCompany.forEach(c => {
      let cIndex = this.props.selectedCompany.indexOf(c)
      let cPalette = this.chart_palette[cIndex]
      areaEles.push(
        <Area
          key={cIndex}
          type="linear"
          connectNulls={true}
          isAnimationActive={false}
          dataKey={c}
          stroke={cPalette.stroke_color} fillOpacity={1} fill={ 'url(#' + cPalette.gradient_name + ')' } />
      )
    })
    return areaEles
  }

  getChartTitle() {
    let chartTitles = []
    if(this.props.selectedCompany.length > 0 && this.props.signalName !== '') {
      this.props.selectedCompany.forEach(c => {
        let cIndex = this.props.selectedCompany.indexOf(c)
        chartTitles.push(
          <div key={c}>
            <ChartTitle><span>{c}</span>: {this.props.signalName} by <span>{this.props.signalValue[cIndex]}%</span> in 2017 <button onClick={() => this.props.removeCompany(c) }>remove</button></ChartTitle>
          </div>
        )
      })
    }
    return chartTitles
  }

  queryData(company_list) {
    let company_promises = company_list.map(c => this.getStock(c))

    Promise.all( company_promises ).then(results => {
      this.setState({
        plot_data_unformatted: results
      })
    })
  }

  componentWillReceiveProps(new_props) {
    this.queryData(new_props.selectedCompany)
  }

  // Query the stock from API
  getStock(stock_name) {
    return new Promise((resolve, reject) => {
      fetch('http://188.166.239.133/get_stock/' + stock_name).then(results => {
        return results.json()
      }).then(data => {
        // Finish querying
        resolve(data)
      })
    })
  }
  

  // Transform plot data into plottable form
  convertedPlotData() {
    // For one stock
    let all_companies = this.state.plot_data_unformatted
    let all_companies_timebased = {}
    let all_companies_ary = []

    // Convert to time-based object
    all_companies.forEach(c => {
      c.forEach(row => {
        // Convert date
        // let key_date = moment(row.pricing_date)
        let key_date = Date.parse(row.pricing_date)
        // Check if key (date) exists
        if(all_companies_timebased[key_date] === undefined) {
          // If key not exist, create the key with stock_name and price_close
          let key_obj = {}
          key_obj[row.stock_name] = row.price_close
          all_companies_timebased[key_date] = Object.assign({}, key_obj)
        } else {
          // If key exists, append the key with stock_name and price_close
          let key_obj = all_companies_timebased[key_date]
          key_obj[row.stock_name] = row.price_close
          all_companies_timebased[key_date] = Object.assign({}, key_obj)
        }
      })
    })

    // Convert the time-based object to plot object
    Object.keys(all_companies_timebased).sort().forEach(key => {
      let date_key = all_companies_timebased[key]
      let date_row = {}
      date_row['time'] = parseInt(key, 10)
      Object.keys(date_key).forEach(stock_name => {
        date_row[stock_name] = date_key[stock_name]
      })

      all_companies_ary.push(date_row)
    })

    return all_companies_ary

    // TODO: Convert multiple stocks
  }

  // getStockNames(companies) {
  //   // Support one stock
  //   let stock_name
  //   if(companies.length > 0) {
  //     stock_name = companies[0]
  //   }
  //   return stock_name
  // }

  componentDidMount() {
    // this.setState({ someKey: 'otherValue' });
  }
}

// Custom tooltip for chart
class CustomTooltip extends Component {
  render() {
    const { active } = this.props;

    if (active) {
      const { payload, label } = this.props;
      if(payload && payload[0]) {
        return (
          <div className="custom-tooltip">
            <TooltipTime>{this.formatDate(label)}<br /></TooltipTime>
            { this.generateStockPrice(payload) }
          </div>
        )
      }
    }

    return null;
  }

  formatDate(ori_date) {
    return moment(ori_date).format('DD/MM/YYYY')
  }

  generateStockPrice(payload) {
    let tooltips = []
    payload.forEach(p => {
      tooltips.push( <TooltipPrice key={p.dataKey}>{p.dataKey}: <strong>${p.value}</strong></TooltipPrice> )
    })
    return tooltips
  }
}

export default StockChart;
