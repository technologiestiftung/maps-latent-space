## Latent Vector Modification in 6 Predetermined Directions:

### About latent-navigation-server.py

1) System requirements 

- Python requirements can be fulfilled by running:
`pip install -r requirements.txt`
- We used `cudatoolkit==10.1.168` and `cudnn==7.6.0`. They are not part of the `requirements.txt` and have to be installed systemwise or via conda.

2) `latent-navigation-server.py` takes as argument the port number, which is defined by default as 9999.

  - In order to define the port number, start the script with: `python latent-navigation-server.py -p <portnumber>`

3) `latent-navigation-server.py` performs as a server which creates a communication link through a socket to receive data, meaning the user input which is stored as JSON.

4) The user input is foreseen as a JSON object in form of: 
`{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": "1234"}`

5) About the JSON object:
  - First 6 elements are for the 6 feature directions. User modifies these values to create new city plans.
  - "7" is for the "random map" button. Pressing the button corresponds to value 1 and the script creates a new `latent.npy` file.
  - "8" for printing (still needs to be discussed)
  - "9" for giving an ID for comparing the sent and received data to see if it is the corresponding answer to the request, which should be implemented on the backend side.
   
6) Output of the script is again a JSON object, which consists of status, name of the image file and the corresponding ID. e.g. "{'status': 'okay', 'file':'custom-map.png', 'id': '1234'}"

7) Random latent vector `latent.npy` and the generated images `custom-map.png` are saved in the same directory as the script.

### About latent-client.py

Script is only implemented for testing purposes. Performs as the corresponding client. Sends and receives JSON objects.
