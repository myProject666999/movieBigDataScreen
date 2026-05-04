import React, { useState, useEffect } from 'react'
import { Row, Col, Spin, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import { statsApi } from '../utils/api'

const RatingAnalysis = () => {
  const [loading, setLoading] = useState(true)
  const [ratingDistribution, setRatingDistribution] = useState([])
  const [starDistribution, setStarDistribution] = useState([])
  const [yearlyRating, setYearlyRating] = useState([])
  const [countryRating, setCountryRating] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ratingRes, starRes, yearlyRes, countryRes] = await Promise.all([
        statsApi.getRatingDistribution(),
        statsApi.getStarDistribution(),
        statsApi.getYearlyRating(),
        statsApi.getCountryRating()
      ])
      setRatingDistribution(ratingRes.data)
      setStarDistribution(starRes.data)
      setYearlyRating(yearlyRes.data)
      setCountryRating(countryRes.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getRatingChartOption = () => {
    if (!ratingDistribution.length) return {}
    return {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ratingDistribution.map(item => item.rating),
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        name: '评分',
        nameTextStyle: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } },
        name: '电影数量',
        nameTextStyle: { color: '#94a3b8' }
      },
      series: [
        {
          name: '电影数量',
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(245, 158, 11, 0.5)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
              ]
            }
          },
          lineStyle: { color: '#f59e0b', width: 3 },
          itemStyle: { color: '#f59e0b' },
          data: ratingDistribution.map(item => item.count)
        }
      ]
    }
  }

  const getStarChartOption = () => {
    if (!starDistribution.length) return {}
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
          name: '星级分布',
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
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          labelLine: {
            show: false
          },
          data: starDistribution.map((item, index) => ({
            value: item.count,
            name: item.star,
            itemStyle: {
              color: [
                '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
                '#3b82f6', '#8b5cf6', '#ec4899'
              ][index % 8]
            }
          }))
        }
      ]
    }
  }

  const getYearlyRatingChartOption = () => {
    if (!yearlyRating.length) return {}
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
        data: yearlyRating.map(item => item.year),
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { 
          color: '#94a3b8',
          rotate: 45
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '平均评分',
          min: 0,
          max: 10,
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#334155' } },
          nameTextStyle: { color: '#94a3b8' }
        },
        {
          type: 'value',
          name: '电影数量',
          axisLine: { lineStyle: { color: '#475569' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { show: false },
          nameTextStyle: { color: '#94a3b8' }
        }
      ],
      series: [
        {
          name: '平均评分',
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#34d399' },
                { offset: 1, color: '#10b981' }
              ]
            },
            borderRadius: [8, 8, 0, 0]
          },
          data: yearlyRating.map(item => item.rating?.toFixed(1) || 0)
        },
        {
          name: '电影数量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          lineStyle: { color: '#f87171', width: 3 },
          itemStyle: { color: '#f87171' },
          data: yearlyRating.map(item => item.count)
        }
      ]
    }
  }

  const getCountryRatingChartOption = () => {
    if (!countryRating.length) return {}
    const topCountries = countryRating.slice(0, 10)
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
        data: topCountries.map(item => item.country).reverse(),
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' }
      },
      series: [
        {
          name: '平均评分',
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
                { offset: 0, color: '#a78bfa' },
                { offset: 1, color: '#8b5cf6' }
              ]
            },
            borderRadius: [0, 8, 8, 0]
          },
          data: topCountries.map(item => item.rating?.toFixed(1) || 0).reverse()
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
      <h2 className="page-title">电影评分分析</h2>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">电影评分折线图</h3>
            <ReactECharts 
              option={getRatingChartOption()} 
              style={{ height: 350 }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">电影星级占比图</h3>
            <ReactECharts 
              option={getStarChartOption()} 
              style={{ height: 350 }}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">年度评分柱状图</h3>
            <ReactECharts 
              option={getYearlyRatingChartOption()} 
              style={{ height: 350 }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">中外评分分布图 (TOP10国家)</h3>
            <ReactECharts 
              option={getCountryRatingChartOption()} 
              style={{ height: 350 }}
            />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default RatingAnalysis
