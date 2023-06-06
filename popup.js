document.addEventListener('DOMContentLoaded', function() {
  var linkContainer = document.getElementById('linkContainer');
  var addLinkButton = document.getElementById('addLinkButton');
  var deleteLinksContainer = document.getElementById('deleteLinksContainer');
  var deleteLinksButton = document.getElementById('deleteLinksButton');
  var goBackButton, deleteButton;

  deleteLinksButton.addEventListener('click', function() {
    deleteLinksContainer.innerHTML = '';

    goBackButton = document.createElement('button');
    goBackButton.innerText = 'Go Back';
    goBackButton.addEventListener('click', function() {
      deleteLinksContainer.innerHTML = '';
      deleteLinksContainer.appendChild(deleteLinksButton);
    });

    deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', function() {
      var checkboxes = document.querySelectorAll('.link-item input[type="checkbox"]:checked');
      var deleteIds = Array.from(checkboxes).map(function(checkbox) {
        return checkbox.getAttribute('data-id');
      });

      if (deleteIds.length > 0) {
        chrome.storage.sync.get('links', function(data) {
          var links = data.links || [];
          var updatedLinks = links.filter(function(link) {
            return !deleteIds.includes(link.id);
          });

          chrome.storage.sync.set({ links: updatedLinks }, function() {
            console.log('Links deleted successfully.');
            displayLinks();
            deleteLinksContainer.innerHTML = '';
            deleteLinksContainer.appendChild(deleteLinksButton);
          });
        });
      }
    });

    deleteLinksContainer.appendChild(goBackButton);
    deleteLinksContainer.appendChild(deleteButton);
  });

  addLinkButton.addEventListener('click', function() {
    var linkNameInput = document.createElement('input');
    linkNameInput.type = 'text';
    linkNameInput.placeholder = 'Enter Link Name';

    var linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.placeholder = 'Enter Link URL';

    var saveLinkButton = document.createElement('button');
    saveLinkButton.innerText = 'Save Link';

    saveLinkButton.addEventListener('click', function() {
      var linkName = linkNameInput.value;
      var link = linkInput.value;

      if (linkName && link) {
        chrome.storage.sync.get('links', function(data) {
          var links = data.links || [];
          var id = generateUniqueId(links);
          links.push({ id: id, name: linkName, url: link });
          chrome.storage.sync.set({ links: links }, function() {
            console.log('Link added successfully.');
            displayLinks();
          });
        });
      }
    });

    linkContainer.appendChild(linkNameInput);
    linkContainer.appendChild(linkInput);
    linkContainer.appendChild(saveLinkButton);
  });

  function displayLinks() {
    linkContainer.innerHTML = '';

    chrome.storage.sync.get('links', function(data) {
      var links = data.links || [];

      for (var i = 0; i < links.length; i++) {
        var linkDiv = document.createElement('div');
        linkDiv.classList.add('link-item');

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.setAttribute('data-id', links[i].id);

        var linkName = document.createElement('span');
        linkName.innerText = links[i].name;

        var goButton = document.createElement('button');
        goButton.innerText = 'Go';

        var idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.setAttribute('data-id', links[i].id);
        idInput.placeholder = 'Enter ID';

        var handleEnterKeyPress = function(event) {
          if (event.keyCode === 13) {
            goButton.click();
          }
        };

        goButton.addEventListener('click', createGoButtonClickHandler(links[i].url, idInput));
        idInput.addEventListener('keydown', handleEnterKeyPress);

        linkDiv.appendChild(checkbox);
        linkDiv.appendChild(linkName);
        linkDiv.appendChild(idInput);
        linkDiv.appendChild(goButton);

        linkContainer.appendChild(linkDiv);
      }
    });
  }

  function createGoButtonClickHandler(url, idInput) {
    return function() {
      var id = idInput.value;
      var link = url + id;

      chrome.tabs.create({ url: link });
    };
  }

  function generateUniqueId(links) {
    var id = Date.now().toString();
    while (links.some(function(link) {
      return link.id === id;
    })) {
      id = Date.now().toString();
    }
    return id;
  }

  displayLinks();
});
