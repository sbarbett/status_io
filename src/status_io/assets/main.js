(function () {
  var client = ZAFClient.init();
  
  client.invoke('resize', { width: '100%', height: '200px' });

  client.metadata().then(function(metadata) {
    var headers = {
      'x-api-key': metadata.settings['API Key'],
      'x-api-id': metadata.settings['API ID']
    }

    document.getElementById('create-incident').addEventListener('click', function() {
      client.get('ticket').then(function(data) {
        var ticketId = data.ticket.id;
        var options = {
          url: 'https://api.status.io/v2/incident/create',
          type: 'POST',
          contentType: 'application/json',
          cors: false,
          headers: headers,
          data: JSON.stringify({
            statuspage_id: metadata['Status Page ID'],
            incident_name: `Incident for ticket #${ticketId}`,
            incident_details: `Incident created from ZenDesk ticket #${ticketId}`,
            incident_status: 'Investigating'
          })
        }

        console.log('Headers:', headers)
        console.log('Options:', options)

        client.request(options).then(function(response) {
          console.log('Response:', response)
          client.set(`ticket.customField:custom_field_${response.incident.id}`, response.incident.id);
        }).catch(function(error) {
          console.log('Error:', error)
        });
      });
    });

    document.getElementById('resolve-incident').addEventListener('click', function() {
      client.get('ticket').then(function(data) {
        var incidentId = data.ticket[`customField:custom_field_${incident.id}`];

        client.request({
          url: `https://api.status.io/v2/incident/resolve/${incidentId}`,
          type: 'POST',
          contentType: 'application/json',
          cors: false,
          headers: headers,
          data: JSON.stringify({
            statuspage_id: metadata['Status Page ID'],
            incident_id: incidentId,
            incident_details: `Incident resolved from ZenDesk ticket #${data.ticket.id}`,
            incident_status: 'Resolved'
          })
        });
      });
    });
  });
})();