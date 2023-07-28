(function () {
  var client = ZAFClient.init();
  
  client.invoke('resize', { width: '100%', height: '200px' });

  client.metadata().then(function(metadata) {
    document.getElementById('create-incident').addEventListener('click', function() {
      client.get('ticket').then(function(data) {
        var ticketId = data.ticket.id;

        client.request({
          url: 'https://api.status.io/1.0/incident/create',
          type: 'POST',
          contentType: 'application/json',
          headers: {
            'api_key': metadata['API Key'],
            'api_id': metadata['API ID']
          },
          data: JSON.stringify({
            statuspage_id: metadata['Status Page ID'],
            incident_name: `Incident for ticket #${ticketId}`,
            incident_details: `Incident created from ZenDesk ticket #${ticketId}`,
            incident_status: 'Investigating'
          })
        }).then(function(response) {
          client.set(`ticket.customField:custom_field_${response.incident.id}`, response.incident.id);
        });
      });
    });

    document.getElementById('resolve-incident').addEventListener('click', function() {
      client.get('ticket').then(function(data) {
        var incidentId = data.ticket[`customField:custom_field_${incident.id}`];

        client.request({
          url: `https://api.status.io/1.0/incident/resolve/${incidentId}`,
          type: 'POST',
          contentType: 'application/json',
          headers: {
            'api_key': metadata['API Key'],
            'api_id': metadata['API ID']
          },
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