import React, { useState, useEffect } from 'react'
import { Row, Col, Spin, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import { statsApi } from '../utils/api'

const Production = () => {
  const [loading, setLoading] = useState(true)
  const [productionData, setProductionData] = useState([])
  const [durationData, setDurationData] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productionRes, durationRes] = await Promise.all([
        statsApi.getYearlyProduction(),
        statsApi.getDurationDistribution()
      ])
      setProductionData(productionRes.data)
      setDurationData(durationRes.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getProductionChartOption = () => {
    if (!productionData.length) return {}
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: productionData.map(item => item.year),
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { 
          color: '#94a3b8',
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      series: [
        {
          name: '电影产量',
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#3b82f6' }
              ]
            },
            borderRadius: [8, 8, 0, 0]
          },
          data: productionData.map(item => item.count)
        }
      ]
    }
  }

  const getDurationChartOption = () => {
    if (!durationData.length) return {}
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}部 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#cbd5e1' }
      },
      series: [
        {
          name: '时长分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#1e293b',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            color: '#cbd5e1',
            formatter: '{b}: {c}部'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true,
            lineStyle: { color: '#60a5fa' }
          },
          data: durationData.map((item, index) => ({
            value: item.count,
            name: item.range,
            itemStyle: {
              color: [
                '#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa'
              ][index % 5]
            }
          }))
        }
      ]
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">历年电影产量与时长分布</h2>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">历年电影产量统计</h3>
            <ReactECharts 
              option={getProductionChartOption()} 
              style={{ height: 400 }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">电影时长分布占比</h3>
            <ReactECharts 
              option={getDurationChartOption()} 
              style={{ height: 400 }}
            />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Production
