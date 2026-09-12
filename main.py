import pyttsx3

engine = pyttsx3.init()

engine.setProperty("rate", 170)      # Speech speed
engine.setProperty("volume", 1.0)    # Volume (0.0 to 1.0)

engine.say("Hello, I am Jarvis. Nice to meet you.")
engine.runAndWait()