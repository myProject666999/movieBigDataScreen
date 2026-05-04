import React, { useState, useEffect } from 'react'
import { Row, Col, Spin, message, Table } from 'antd'
import ReactECharts from 'echarts-for-react'
import { statsApi } from '../utils/api'

const LocationLanguage = () => {
  const [loading, setLoading] = useState(true)
  const [locationData, setLocationData] = useState([])
  const [languageData, setLanguageData] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [locationRes, languageRes] = await Promise.all([
        statsApi.getLocations(),
        statsApi.getLanguages()
      ])
      setLocationData(locationRes.data)
      setLanguageData(languageRes.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getLocationChartOption = () => {
    if (!locationData.length) return {}
    const topLocations = locationData.slice(0, 15)
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
        type: 'value',
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      yAxis: {
        type: 'category',
        data: topLocations.map(item => item.location).reverse(),
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' }
      },
      series: [
        {
          name: '电影数量',
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#3b82f6' }
              ]
            },
            borderRadius: [0, 8, 8, 0]
          },
          data: topLocations.map(item => item.count).reverse()
        }
      ]
    }
  }

  const getLanguageChartOption = () => {
    if (!languageData.length) return {}
    const topLanguages = languageData.slice(0, 10)
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
          name: '语言分布',
          type: 'pie',
          radius: ['30%', '60%'],
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
          data: topLanguages.map((item, index) => ({
            value: item.count,
            name: item.language,
            itemStyle: {
              color: [
                '#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa',
                '#f472b6', '#22d3d8', '#fb923c', '#818cf8', '#4ade80'
              ][index % 10]
            }
          }))
        }
      ]
    }
  }

  const locationColumns = [
    {
      title: '排名',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1
    },
    {
      title: '拍摄地点',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '电影数量',
      dataIndex: 'count',
      key: 'count',
      render: (count) => (
        <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{count}</span>
      )
    }
  ]

  const languageColumns = [
    {
      title: '排名',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language'
    },
    {
      title: '电影数量',
      dataIndex: 'count',
      key: 'count',
      render: (count) => (
        <span style={{ color: '#34d399', fontWeight: 'bold' }}>{count}</span>
      )
    }
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">拍摄地点与语言统计</h2>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">拍摄地点统计 (TOP15)</h3>
            <ReactECharts 
              option={getLocationChartOption()} 
              style={{ height: 400 }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">电影语言统计 (TOP10)</h3>
            <ReactECharts 
              option={getLanguageChartOption()} 
              style={{ height: 400 }}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">拍摄地点详情</h3>
            <Table
              columns={locationColumns}
              dataSource={locationData}
              rowKey="location"
              pagination={{ pageSize: 10 }}
              className="table-container"
              size="middle"
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">语言详情</h3>
            <Table
              columns={languageColumns}
              dataSource={languageData}
              rowKey="language"
              pagination={{ pageSize: 10 }}
              className="table-container"
              size="middle"
            />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default LocationLanguage
