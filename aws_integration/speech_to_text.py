import boto3
import time

transcribe = boto3.client('transcribe')

def transcribe_audio(audio_file, job_name, output_bucket):
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': f's3://{output_bucket}/{audio_file}'},
        MediaFormat='mp3',
        LanguageCode='en-US'
    )

    while True:
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
            break
        print('Waiting for the transcription job to complete...')
        time.sleep(30)

    print('Transcription completed:', status['TranscriptionJob']['Transcript']['TranscriptFileUri'])


transcribe_audio('audio.mp3', 'my_transcription_job', 'my-s3-bucket')
