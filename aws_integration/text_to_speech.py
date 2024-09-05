import boto3


polly = boto3.client('polly')

def text_to_speech(text, output_file):
    response = polly.synthesize_speech(
        Text=text,
        OutputFormat='mp3',
        VoiceId='Joanna' 
    )
    with open(output_file, 'wb') as file:
        file.write(response['AudioStream'].read())


text_to_speech('Hello, this is a test.', 'output.mp3')
