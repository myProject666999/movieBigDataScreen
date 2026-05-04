import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Spin, message } from 'antd'
import { FilmOutlined, StarOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { statsApi } from '../utils/api'

const Home = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await statsApi.getHomeStats()
      setStats(response.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getGenreChartOption = () => {
    if (!stats?.genre_distribution) return {}
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#cbd5e1' }
      },
      series: [
        {
          name: '电影类型',
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
          data: stats.genre_distribution.map((item, index) => ({
            value: item.count,
            name: item.name,
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

  const getRatingChartOption = () => {
    if (!stats?.rating_by_year) return {}
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
        boundaryGap: false,
        data: stats.rating_by_year.map(item => item.year),
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 10,
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      series: [
        {
          name: '平均评分',
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
                { offset: 0, color: 'rgba(96, 165, 250, 0.5)' },
                { offset: 1, color: 'rgba(96, 165, 250, 0.05)' }
              ]
            }
          },
          lineStyle: { color: '#60a5fa', width: 3 },
          itemStyle: { color: '#60a5fa' },
          data: stats.rating_by_year.map(item => item.rating?.toFixed(1) || 0)
        }
      ]
    }
  }

  const columns = [
    {
      title: '排名',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1
    },
    {
      title: '电影名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 100
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => (
        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
          <StarOutlined /> {rating}
        </span>
      )
    },
    {
      title: '类型',
      dataIndex: 'genres',
      key: 'genres'
    }
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  const statCards = [
    {
      title: '电影总数',
      value: stats?.movie_count || 0,
      icon: <FilmOutlined />,
      color: '#60a5fa'
    },
    {
      title: '最高评分',
      value: stats?.top_rating || 0,
      icon: <StarOutlined />,
      color: '#f59e0b'
    },
    {
      title: '出场最多演员',
      value: stats?.top_actor?.name || '-',
      subValue: `${stats?.top_actor?.movie_count || 0} 部`,
      icon: <UserOutlined />,
      color: '#34d399'
    },
    {
      title: '制片最多国家',
      value: stats?.top_country?.location || '-',
      subValue: `${stats?.top_country?.count || 0} 部`,
      icon: <GlobalOutlined />,
      color: '#f87171'
    }
  ]

  return (
    <div>
      <h2 className="page-title">首页统计</h2>
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <div className="stats-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label" style={{ marginBottom: 8 }}>{card.title}</div>
                  <div className="stat-value" style={{ fontSize: 28, color: card.color }}>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </div>
                  {card.subValue && (
                    <div style={{ color: '#94a3b8', fontSize: 14 }}>{card.subValue}</div>
                  )}
                </div>
                <div style={{ fontSize: 40, color: card.color, opacity: 0.5 }}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">电影类型分布</h3>
            <ReactECharts 
              option={getGenreChartOption()} 
              style={{ height: 350 }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-card">
            <h3 className="chart-title">历年评分趋势</h3>
            <ReactECharts 
              option={getRatingChartOption()} 
              style={{ height: 350 }}
            />
          </div>
        </Col>
      </Row>

      <div className="chart-card">
        <h3 className="chart-title">热门电影TOP10</h3>
        <Table
          columns={columns}
          dataSource={stats?.movie_list || []}
          rowKey="id"
          pagination={false}
          className="table-container"
        />
      </div>
    </div>
  )
}

export default Home
