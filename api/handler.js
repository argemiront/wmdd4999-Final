'use strict';
const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const arrayMove = require('array.prototype.move')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const tableSongs = 'take-home'
const tablePlaylist = 'take-home-playlists'
const bucketName = 'take-home-data'


module.exports.created = (event) => {

  event.Records.forEach((record) => {

    const params = {
      TableName: tableSongs,
      Item: {
        id: record.s3.object.key,
        title: record.s3.object.key.replace(/\+/g, ' '),
        size: record.s3.object.size,
        created: record.eventTime
      }
    }
  
    dynamoDb.put(params, (err, results) => {
      if (err) {
        console.error(err)
        return
      }

      console.log(results)
    })

    const listAllAdd = {
      TableName: tablePlaylist,
      Key: {
        id: 'aaa',
      },
      UpdateExpression: 'SET songs = list_append(songs, :song)',
      ExpressionAttributeValues: {
        ':song': [record.s3.object.key]
      },
      ReturnValues: 'UPDATED_NEW'
    }

    dynamoDb.update(listAllAdd, (err, results) => {
      if (err) {
        console.error(err)
        return
      }

      console.log(results)
    })
  })
}

module.exports.listSongs = (event, context, callback) => {

  const params = {
      TableName: tableSongs
  }

  dynamoDb.scan(params, (err, results) => {
      if (err) {
          console.error(err)
          callback(err)
          return
      }

      const response = {
          statusCode: 200,
          headers: {
              "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify(results.Items)
      }

      callback(null, response)
  })
}

module.exports.listPlaylists = (event, context, callback) => {

  const params = {
      TableName: tablePlaylist
  }

  dynamoDb.scan(params, (err, results) => {
      if (err) {
          console.error(err)
          callback(err)
          return
      }

      let alist = results.Items.find(el => el.id === 'aaa')
      const index = results.Items.indexOf(alist)
      results.Items.move(index, 0)
      console.log('Lista completa', results.Items)

      const response = {
          statusCode: 200,
          headers: {
              "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify(results.Items)
      }

      callback(null, response)
  })
}

module.exports.createPlaylist = (event, context, callback) => {

  const data = JSON.parse(event.body)

  const params = {
    TableName: tablePlaylist,
    Item: {
      id: uuid(),
      title: data.title,
      subtitle: data.subtitle,
      songs: data.songs
    }
  }

  dynamoDb.put(params, (err, results) => {
    if (err) {
      console.error(err)
      callback(new Error('error on creating the playlist'))
      return
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(results)
    })
  })
}
