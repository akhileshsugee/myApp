import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

 @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  isWeb = Capacitor.getPlatform() === 'web';
  capturedImage: string | null = null;
  private stream: MediaStream | null = null;

  constructor(private modalCtrl: ModalController, private platform: Platform) {}

  ngOnInit(): void {}

  ionViewDidEnter() {
    if (this.isWeb) {
      this.startWebCamera();
    }
  }

  ngOnDestroy(): void {
    this.stopWebCamera();
  }

async startWebCamera() {
  try {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: 'environment' } }
    });
    this.videoElement.nativeElement.srcObject = this.stream;
    this.videoElement.nativeElement.play();
  } catch (err) {
    console.error('Error accessing rear camera:', err);
    alert('Rear camera not found. Using default.');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.videoElement.nativeElement.play();
    } catch (fallbackErr) {
      alert('No camera found.');
      this.closeModal();
    }
  }
}

  stopWebCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  async takePhoto() {
    if (this.isWeb) {
      const canvas = document.createElement('canvas');
      const video = this.videoElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/png');
      this.stopWebCamera();
      this.modalCtrl.dismiss({ image: this.capturedImage });
    } else {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear, // Force use of the back camera
      });
      this.capturedImage = image.dataUrl!;
      this.modalCtrl.dismiss({ image: this.capturedImage });
    }
  }

  closeModal() {
    this.stopWebCamera();
    this.modalCtrl.dismiss();
  }
}
