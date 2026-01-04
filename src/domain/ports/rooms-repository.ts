export interface RoomRecord {
  id: string
  userId: string
  audioUploads: number
}

export interface RoomsRepository {
  findById(roomId: string): Promise<RoomRecord | null>
  create(data: { name: string; description?: string | null; userId: string }): Promise<{ id: string }>
  incrementAudioUploads(roomId: string): Promise<void>
}
