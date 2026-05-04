import React, { useState, useEffect } from 'react'
import { Row, Col, Spin, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import { statsApi } from '../utils/api'

const Rankings = () => {
  const [loading, setLoading] = useState(true)
  const [directors, setDirectors] = useState([])
  const [actors, setActors] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [directorsRes, actorsRes] = await Promise.all([
        statsApi.getTopDirectors(),
        statsApi.getTopActors()
      ])
      setDirectors(directorsRes.data)
      setActors(actorsRes.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getDirectorsChartOption = () => {
    if (!directors.length) return {}
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c}部电影'
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
        data: directors.map(item => item.name).reverse(),
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
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#d97706' }
              ]
            },
            borderRadius: [0, 8, 8, 0]
          },
          data: directors.map(item => item.movie_count).reverse()
        }
      ]
    }
  }

  const getActorsChartOption = () => {
    if (!actors.length) return {}
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c}部电影'
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
        data: actors.map(item => item.name).reverse(),
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
                { offset: 0, color: '#34d399' },
                { offset: 1, color: '#10b981' }
              ]
            },
            borderRadius: [0, 8, 8, 0]
          },
          data: actors.map(item => item.movie_count).reverse()
        }
      ]
    }
  }

  const renderRankList = (data, type) => {
    return (
      <ul className="rank-list">
        {data.map((item, index) => (
          <li key={index} className="rank-item">
            <span className={`rank-number ${index < 3 ? `top-${index + 1}` : ''}`}>
              {index + 1}
            </span>
            <span className="rank-name">
              {type === 'director' ? item.name : item.name}
            </span>
            <span className="rank-count">
              {item.movie_count} 部
            </span>
          </li>
        ))}
      </ul>
    )
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
      <h2 className="page-title">导演与演员排行榜</h2>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">导演作品数量TOP20</h3>
            <ReactECharts 
              option={getDirectorsChartOption()} 
              style={{ height: 500 }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">演员参演电影数TOP20</h3>
            <ReactECharts 
              option={getActorsChartOption()} 
              style={{ height: 500 }}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">导演排行榜详情</h3>
            {renderRankList(directors, 'director')}
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">演员排行榜详情</h3>
            {renderRankList(actors, 'actor')}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Rankings
