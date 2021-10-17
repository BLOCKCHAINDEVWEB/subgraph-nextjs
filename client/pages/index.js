import React from 'react'
import styles from '../styles/Home.module.css'

import { createClient } from 'urql'

const APIURL = 'https://api.studio.thegraph.com/query/11783/zola/0.1.0'

const tokensQuery = `
  query {
    tokens(
      orderDirection: desc
      orderBy: createdAtTimestamp
      first: 10
    ) {
      id
      tokenID
      contentURI
      metadataURI
    }
  }
`

const client = createClient({
  url: APIURL
})

export default function Home(props) {
  return (
    <div className="grid grid-cols-3 gap-4 px-10 py-10">
      {props.tokens.map(token => {
        return (
          <div key={token.id} className="shadow-lg bg-transparent rounded-2xl overflow-hidden">
            <div className="w-100% h-100%">
              {token.type === 'image' && (
                <div style={{height: '320px', overflow: 'hidden'}}>
                  <img className="object-contain" style={{ minHeight: '320px' }} src={token.contentURI} />
                </div>
              )}
              {token.type === 'audio' && (
                <figure>
                  <figcaption>Listen "{token.meta.body.title}" by {token.meta.body.artist}</figcaption>
                    <audio controls>
                      <source src={token.contentURI} type="audio/ogg" />
                      <source src={token.contentURI} type="audio/mpeg" />
                    Your browser does not support the audio element.
                    </audio>
                </figure>
              )}
              {token.type === 'video' && (
                <div className="relative">
                  <div style={{width: '288px', height: '320px', boxSizing: 'border-box'}} />
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                    <video height="auto" controls autoPlay
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover'
                    }}>
                      <source src={token.contentURI} />
                    </video>
                  </div>
                </div>
              )}
              {token.type === 'text' && (
                <div className="px-2 pt-2 pb-10">
                  <h3 style={{ height: 100 }} className="text-2xl p-4 pt-6 font-semibold">
                    {token.meta.name}
                  </h3>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
async function fetchData() {
  let data = await client.query(tokensQuery).toPromise()

  let tokenData = await Promise.all(data.data.tokens.map(
    async token => {
      let meta
      try {
        const metaData = await fetch(token.metadataURI)
        let response = await metaData.json()
        meta = response
      } catch (err) {
        console.log(`Error internal: ${err}`)
      }

      if (!meta) return

      if (meta.body && meta.body.mimeType.includes('wav')) {
        token.type = 'audio'
      } else if (meta.mimeType.includes('mp4')) {
        token.type = 'video'
      } else if (meta.mimeType.includes('image')) {
        token.type = 'image'
      } else if (meta.mimeType.includes('text')) {
        token.type = 'text'
      }

      token.meta = meta
      return token
    }
  ))
  return tokenData
}

export async function getServerSideProps() {
  const data = await fetchData()
  return {
    props: {
      tokens: data
    }
  }
}
