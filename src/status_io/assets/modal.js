(function () {
  var client = ZAFClient.init();
  console.log(client);
  client.invoke('resize', { width: '90vw', height: '90vh' });
  client.on('app.registered', init)

  function init() {
    var params = parseParams(window.location.hash);
    console.log("Params", params.parent_guid);
    var pc = getParentClient(params.parent_guid);
    pc.metadata().then(function(metadata) {
      var headers = {
        'x-api-key': metadata.settings['API Key'],
        'x-api-id': metadata.settings['API ID']
      }

      var options = {
        url: `https://api.status.io/v2/component/list/${metadata.settings['Status Page ID']}`,
        type: 'GET',
        contentType: 'application/json',
        cors: false,
        headers: headers
      }

      client.request(options).then(function(response) {
        var infrastructureSelect = document.getElementById('infrastructure-affected');
        response.result.forEach(function(component) {
          component.containers.forEach(function(container) {
            var option = document.createElement('option');
            option.value = `${component._id}-${container._id}`;
            option.text = `${component.name} - ${container.name}`;
            infrastructureSelect.appendChild(option);
          });
        });
        document.getElementById('incident-form').style.display = 'block';
      }).catch(function(error) {
        console.log('Error:', error);
      });

      document.getElementById('create-incident-modal').addEventListener('click', function() {
        // Fetch ticket data
        pc.get('ticket').then(function(data) {
          var ticketId = data.ticket.id;
          var incidentName = document.getElementById('incident-name').value;
          var incidentDetails = document.getElementById('incident-details').value;
          var infrastructureAffected = document.getElementById('infrastructure-affected').value;

          var options = {
            url: 'https://api.status.io/v2/incident/create',
            type: 'POST',
            contentType: 'application/json',
            cors: false,
            headers: headers,
            data: JSON.stringify({
              statuspage_id: metadata.settings['Status Page ID'],
              infrastructure_affected: [infrastructureAffected],
              incident_name: incidentName,
              incident_details: incidentDetails,
              current_status: 300,
              current_state: 100,
              social: "0"
            })
          }

          pc.request(options).then(function(response) {
            console.log('Response:', response);
            //client.invoke('instances.destroy');
          }).catch(function(error) {
            console.log('Error:', error);
          });
        });
      });
    });
  }

  function parseParams(param_string){
    var param_sub = param_string.replace('#','').split('&');
    var param_obj = param_sub.reduce(function(memo, k){
      kv = k.split('=');
      memo[kv[0]] = kv[1];
      return memo;
    }, {});
    return param_obj;
  };

  function getParentClient(parent_guid) {
    return client.instance(parent_guid)
  }

})();
