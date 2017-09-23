# Todo List

### ChatBot
- Get user storage in mongo working
- Figure out how to catch uploading a photo on messenger
- Figure out how to get sent a message to user when Document is signed 
	- Naive method might be to use a setInterval that checks our db whether document is signed
- Integrate BotKit for conversational context and state
- Implement FSM and persist each user's conversational state somewhere (memory or MongoDB)

### WebApp
- (Stan) Start creating separate web application for doctor with upload preferably with interfaces to both Docusign and 
- (Stan) Create CLI argument flag for using either Docusign or Other document signing

### ML Classification Server
- (Mike) Create scraper for images
- (Mike) Find images of negative cases for diseases
- (Mike) Train classification model with images
- (Mike) Create server 


- Do we



# Architecture

## Models
```
// stored when created by connecting a new user on FB
class Patient {
  string name
  string email
  string phoneNumber
  boolean liabilityWaiverSigned
}

// created by doctor in web application
class Doctor {
  string name
  string email
  string phoneNumber
}

// uploaded by patients
class Image {
  date createdAt
  string encodedImage // base64 encoded image
  Patient patientId - foreign key relation
  string classification
  
}
```