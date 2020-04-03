import googlemaps
import urllib.request
import json
import apiKey
country = "country:RO"
rawGeo ='https://maps.googleapis.com/maps/api/geocode/json?'
rawDir = "https://maps.googleapis.com/maps/api/directions/json?"

def convToAscii(text):
    return text.replace("ă","a").replace("î","i").replace("ț","t").replace("ș","s").replace("â","a").replace(' ','+')

def checkIfExists(name, country):
    name = convToAscii(name)
    onlyLoc = "address={}&key={}&components={}".format(name, apiKey.goagalKey, country)
    request = rawGeo + onlyLoc
    response = urllib.request.urlopen(request).read()
    result = json.loads(response)
    # print(result.keys())
    # print(result['results'])
    if(len(result['results'])):
        # print("coordinates:")
        # print(result['results'][0]['geometry']['location'])
        # print(result['results'][0]["formatted_address"])
        print("found it")

        return convToAscii(str((result['results'][0]['address_components'][0]['long_name'])))

    else:
        print("couldn't find it")

# print(loc)
# print(checkIfExists(loc, country))

# print(result['results'][0]['address_components'][0]['long_name'])


def makeDir(orig, dest):
    onlyLoc = "origin={}&key={}&destination={}".format(orig, apiKey.goagalKey, dest)
    request = rawDir + onlyLoc
    response = urllib.request.urlopen(request).read()
    result = json.loads(response)
    # print(result['geocoded_waypoints'])
    print(result['routes'][0]['legs'][0]['distance'])


# makeDir(checkIfExists("iasi", country),checkIfExists("Galati",country))
checkIfExists("palatul culturii",country)
