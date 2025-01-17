import React, { useState, useEffect } from 'react'
import moment from 'moment'
import get from 'lodash.get'
import ReactTwitchEmbedVideo from 'react-twitch-embed-video'
import cookie from 'react-cookies'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import fetch from '../modules/fetch-with-headers'
import { formatTime, formatDateTime } from '../modules/guess-local-tz'
import getApiUrl from '../modules/get-api-url'
import Chrome from '../components/Chrome'
import handleError from '../modules/handle-error'
import { PageTitle, MatchBox, linkString } from '../components/elements'
import SingleTeam from '../components/SingleTeam'

const DayColumn = styled.div`

`

const CalendarDark = styled.div`
  box-shadow: 0px 0px 35px -16px rgba(0, 0, 0, 0.75);
  color: #363b41;
  background-image: linear-gradient(-222deg, #222, #111);
  color: #fff;
`

const CalendarEvents = styled.div`
  color: white;
`

const EventItem = styled.div`
  padding: 5px;
`

function SingleEvent ({ event }) {
  return (
    <EventItem key={`${event.home.name}-${event.away.name}-${event.start_time}`}>
      <p className='italic text-xs'>{formatTime(event.start_time)}</p>
      <p className='font-bold text-xs'>{`${event.home.name} vs. ${event.away.name}`}</p>

      { event.circuit
        ? <p className='mt-1 text-xs italic'><Link className='text-gray-1' to={`/circuits/${event.circuit.id}/`}>{event.circuit.name}</Link></p>
        : null }

      { event.primary_caster
        ? <a target='_blank' rel='noreferrer' className='text-xs' href={event.primary_caster.stream_link}>{event.primary_caster.name}</a>
        : <span className='text-xs italic'>Looking for caster</span> }

    </EventItem>
  )
}

function TvGuide ({ schedule }) {
  return (
    <div style={{ backgroundImage: 'repeating-linear-gradient(45deg, #202020, #202020 30px, #222 30px, #222 60px)' }} className='shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7'>
      <DayColumn>
        <div className='bg-blue-3 font-bold text-center p-2'>Today</div>
        <CalendarDark>
          <CalendarEvents>
            { get(schedule, `[${moment().format('YYYYMMDD')}]`, []).map((event) => {
              return (
                <SingleEvent key={`${event.home.name}-${event.away.name}-${event.start_time}`} event={event} />
              )
            })}
          </CalendarEvents>
        </CalendarDark>
      </DayColumn>
      <DayColumn>
        <div className='bg-blue-3 font-bold text-center p-2'>Tomorrow</div>
        <CalendarDark>
          <CalendarEvents>
            { get(schedule, `[${moment().add(1, 'days').format('YYYYMMDD')}]`, []).map((event) => {
              return (
                <SingleEvent key={`${event.home.name}-${event.away.name}-${event.start_time}`} event={event} />
              )
            })}
          </CalendarEvents>
        </CalendarDark>
      </DayColumn>
      <DayColumn>
        <div className='bg-blue-3 font-bold text-center p-2'>{moment().add(2, 'days').format('M/D')}</div>
        <CalendarDark>
          <CalendarEvents>
            { get(schedule, `[${moment().add(2, 'days').format('YYYYMMDD')}]`, []).map((event) => {
              return (
                <SingleEvent key={`${event.home.name}-${event.away.name}-${event.start_time}`} event={event} />
              )
            })}
          </CalendarEvents>
        </CalendarDark>
      </DayColumn>
      <DayColumn>
        <div className='bg-blue-3 font-bold text-center p-2'>{moment().add(3, 'days').format('M/D')}</div>
        <CalendarDark>
          <CalendarEvents>
            { get(schedule, `[${moment().add(3, 'days').format('YYYYMMDD')}]`, []).map((event) => {
              return (
                <SingleEvent key={`${event.home.name}-${event.away.name}-${event.start_time}`} event={event} />
              )
            })}
          </CalendarEvents>
        </CalendarDark>
      </DayColumn>
      <DayColumn>
        <div className='bg-blue-3 font-bold text-center p-2'>{moment().add(4, 'days').format('M/D')}</div>
        <CalendarDark>
          <CalendarEvents>
            { get(schedule, `[${moment().add(4, 'days').format('YYYYMMDD')}]`, []).map((event) => {
              return (
                <SingleEvent key={`${event.home.name}-${event.away.name}-${event.start_time}`} event={event} />
              )
            })}
          </CalendarEvents>
        </CalendarDark>
      </DayColumn>
      <DayColumn>
        <div className='bg-blue-3 font-bold text-center p-2'>{moment().add(5, 'days').format('M/D')}</div>
        <CalendarDark>
          <CalendarEvents>
            { get(schedule, `[${moment().add(5, 'days').format('YYYYMMDD')}]`, []).map((event) => {
              return (
                <SingleEvent key={`${event.home.name}-${event.away.name}-${event.start_time}`} event={event} />
              )
            })}
          </CalendarEvents>
        </CalendarDark>
      </DayColumn>
      <DayColumn>
        <div className='bg-blue-3 font-bold text-center p-2'>{moment().add(6, 'days').format('M/D')}</div>
        <CalendarDark>
          <CalendarEvents>
            { get(schedule, `[${moment().add(6, 'days').format('YYYYMMDD')}]`, []).map((event) => {
              return (
                <SingleEvent key={`${event.home.name}-${event.away.name}-${event.start_time}`} event={event} />
              )
            })}
          </CalendarEvents>
        </CalendarDark>
      </DayColumn>
    </div>
  )
}

function sortEventsIntoDates (events) {
  const sorted = {}
  events.forEach((event) => {
    // check to see if we have this date
    if (sorted[`${moment(event.start_time).format('YYYYMMDD')}`]) {
      sorted[`${moment(event.start_time).format('YYYYMMDD')}`].push(event)
    } else {
      sorted[`${moment(event.start_time).format('YYYYMMDD')}`] = [event]
    }
  })

  return sorted
}

function Home () {
  const userId = cookie.load('userId')
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState({})
  const [profile, setProfile] = useState({})
  const [playerMatches, setPlayerMatches] = useState({})
  useEffect(() => {
    const fetchData = async () => {
      const promises = []
      promises.push(fetch(`${getApiUrl()}matches/?days=7&scheduled=true&limit=100`)
        .then(data => data.json())
        .then(data => () => sortEventsIntoDates(data.results))
        .then(data => setSchedule(data))
        .catch(handleError))

      promises.push(fetch(`${getApiUrl()}me/?format=json`)
        .then(data => data.json())
        .then(data => setProfile(data))
        .catch(handleError))

      promises.push(fetch(`${getApiUrl()}matches/?player=${userId}&days=90`)
        .then(data => data.json())
        .then(data => setPlayerMatches(data.results))
        .catch(handleError))

      Promise.all(promises).then(() => {
        setLoading(false)
      })
    }

    fetchData()
  }, [])

  const token = cookie.load('token', true)
  return (
    <Chrome>
      {
        loading
          ? <div>loading...</div>
          : (
            <div>
              <div className='mb-8 sm:mt-8 md:mt-0 grid grid-cols-1 md:grid-cols-content'>
                <div className='max-w-lg overflow-hidden'>
                  <PageTitle>Check out BeeGameLeague on Twitch</PageTitle>
                  <ReactTwitchEmbedVideo height='300' layout='video' channel='BeeGameLeague' />
                </div>
                {
                  token
                    ? (
                      <div>
                        <PageTitle>Your Teams</PageTitle>
                        { get(profile, 'player.teams')
                          ? (
                            <>
                              { profile.player.teams
                                .filter(x => x.is_active)
                                .map(x => (
                                  <div key={`${x.id}-${x.name}`} className='my-2'>
                                    <SingleTeam className='text-md' team={x} />
                                  </div>
                                ))}
                            </>
                          ) : <span>You're not on any teams. <Link to='/register'>Register a new one</Link></span>}

                        <PageTitle className='mt-4'>Your Upcoming Matches</PageTitle>
                        { playerMatches.length
                          ? (
                            playerMatches.map((match) => (
                              <MatchBox key={`match-${match.id}`} match={match}>
                                {formatDateTime(match.start_time)}
                              </MatchBox>
                            ))
                          )
                          : (
                        <>
                          <div>You have no match this week</div>
                          <div className='text-xs'>(That may be because you have a Bye week)</div>
                        </>
                          )
                        }

                      </div>
                    )
                    : (
                      <div className='text-xl'>
                        <a className={`${linkString}`} href={`${getApiUrl()}accounts/discord/login/`}>Login</a> to see your upcoming matches
                      </div>
                    )
                }
              </div>

              <PageTitle className='mt-8'>Upcoming Matches</PageTitle>
              <TvGuide schedule={schedule} />
            </div>

          )
      }
    </Chrome>
  )
}

export default Home
